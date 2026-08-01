import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateMovieDto } from './dto/createMovie.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { UpdateMovieDto } from './dto/updateMovie.dto';
import { Prisma } from '@prisma/client';
import { GetAllMoviesDto } from './dto/getAllMovies.dto';
import { GetMoviesBySearch } from './dto/getMovieBySearch';

@Injectable()
export class MovieService {
    constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

    async createMovie(createMovieDto: CreateMovieDto, trailer: UploadedFileType, thumbnail: UploadedFileType, banner?: UploadedFileType) {
        const { name, countryId, genreIds, actorIds, ...createMovieData } = createMovieDto
        let bannerUrl: string | null = null
        const [existingName, country] = await this.prisma.$transaction([
            this.prisma.movie.findFirst({
                where: {
                    name: name
                }
            }),
            this.prisma.country.findUnique({
                where: {
                    id: countryId
                }
            })
        ])
        if (existingName) {
            throw new ConflictException('Tên phim đã tồn tại')
        }
        if (!country) {
            throw new NotFoundException('Không tìm thấy Id quốc gia')
        }

        const uploadTrailer = await this.cloudinary.uploadImage(trailer, 'trailer', 'video')
        const uploadThumbnail = await this.cloudinary.uploadImage(thumbnail, 'thumbnail', 'image')
        if (banner) {
            const uploadBanner = await this.cloudinary.uploadImage(banner, 'banner', 'image')
            bannerUrl = uploadBanner.secure_url
        }

        const movie = await this.prisma.movie.create({
            data: {
                ...createMovieData,
                name: name,
                country: {
                    connect: {
                        id: countryId
                    }
                },
                trailer: uploadTrailer.secure_url,
                thumbnail: uploadThumbnail.secure_url,
                banner: bannerUrl,
                genres: {
                    connect: genreIds.map((id) => ({ id }))
                },
                actors: {
                    connect: actorIds.map((id) => ({ id }))
                },
            }
        })
        return movie
    }
    async updateMovie(movieId: number, updateMovieDto: UpdateMovieDto, trailer?: UploadedFileType, thumbnail?: UploadedFileType, banner?: UploadedFileType) {
        const { name, countryId, genreIds, actorIds, ...updateMovieData } = updateMovieDto

        const updateData: Prisma.MovieUpdateInput = {
            ...updateMovieData
        }

        if (name) {
            const existingName = await this.prisma.movie.findFirst({
                where: { name: name, id: { not: movieId } }
            })
            if (existingName) {
                throw new ConflictException('Tên phim đã tồn tại')
            }
            updateData.name = name.trim()
        }
        if (countryId) {
            const country = await this.prisma.country.findUnique({
                where: {
                    id: countryId
                }
            })
            if (!country) {
                throw new NotFoundException('Không tìm thấy Id quốc gia')
            }
            updateData.country = { // do dùng Primsa Type nên sẽ làm ở relation và dùng conect để connect vô
                // ở đây thì nghĩa là hãy Hãy nối (connect) Movie này với Country có id theo update và ở countryId thì sẽ đc set id đó
                connect: {
                    id: countryId
                }
            }
        }
        if (trailer) {
            const uploadTrailer = await this.cloudinary.uploadImage(trailer, 'trailer', 'video')
            updateData.trailer = uploadTrailer.secure_url
        }
        if (thumbnail) {
            const uploadThumbnail = await this.cloudinary.uploadImage(
                thumbnail,
                'thumbnail',
                'image'
            );

            updateData.thumbnail = uploadThumbnail.secure_url;
        }

        if (banner) {
            const uploadBanner = await this.cloudinary.uploadImage(
                banner,
                'banner',
                'image'
            );

            updateData.banner = uploadBanner.secure_url;
        }
        if (genreIds) {
            const genres = await this.prisma.genre.findMany({
                where: {
                    id: {
                        in: genreIds
                    }
                }
            });

            if (genres.length !== genreIds.length) {
                throw new NotFoundException(
                    'Có thể loại không tồn tại'
                );
            }

            updateData.genres = {
                set: genreIds.map(id => ({ id }))
            };
        }

        if (actorIds) {
            const actors = await this.prisma.actor.findMany({
                where: {
                    id: {
                        in: actorIds
                    }
                }
            });

            if (actors.length !== actorIds.length) {
                throw new NotFoundException(
                    'Có diễn viên không tồn tại'
                );
            }

            updateData.actors = {
                set: actorIds.map(id => ({ id }))
            };
        }

        const updateMovie = await this.prisma.movie.update({
            where: {
                id: movieId
            },
            data: updateData,
            include: {
                country: true,
                genres: true,
                actors: true
            }
        });
        return updateMovie

    }
    async updateMovieStatus(movieId: number) {
        const movie = await this.prisma.movie.findUnique({
            where: {
                id: movieId
            }
        })
        if (!movie) {
            throw new NotFoundException('Không tìm thấy phim');
        }
        await this.prisma.movie.update({
            where: {
                id: movieId
            },
            data: {
                isActive: !movie.isActive
            }
        })
    }
    async getAllMovies(getAllMoviesDto: GetAllMoviesDto) {
        const { search, page } = getAllMoviesDto
        const limit = 5
        const skip = (page - 1) * limit

        const whereCondition = {
            ...(search ? {
                OR: [
                    {
                        name: {
                            contains: search // contains thì giống like tìm từ gần giống
                        }
                    },
                    {
                        releaseYear: Number(search)
                    }
                ]
            } : {})
        }
        const [movies, totalMovies] = await this.prisma.$transaction([
            this.prisma.movie.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    genres: true,
                    actors: true,
                    country: true
                }
            }),
            this.prisma.movie.count({
                where: whereCondition
            })
        ])
        return {
            movies: movies,
            pagination: {
                page: page,
                limit: limit,
                totalMovies: totalMovies,
                totalPages: Math.ceil(totalMovies / limit)
            }
        }
    }

    async getInfoMovie(movieId: number) {
        const movie = await this.prisma.movie.findUnique({
            where: {
                id: movieId
            },
            include: {
                country: true,
                genres: true,
                actors: true
            }
        })
        return movie
    }
    async getMoviesBySearch(getMoviesBySearch: GetMoviesBySearch) {
        const { search } = getMoviesBySearch

        if (!search || search.trim() === "") {
            return [];
        }
        const movies = await this.prisma.movie.findMany({
            where: {
                name: {
                    contains: search.trim()
                }
            },
            include: {
                country: true,
                genres: true,
                actors: true
            }
        })
        return movies
    }

    async getMovieRandom() {
        const totalMovies = await this.prisma.movie.count({
            where: { isActive: true }
        })
        if (totalMovies === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * totalMovies) + 1
        console.log(randomIndex, totalMovies)
        const movie = await this.prisma.movie.findMany({
            where: {
                id: randomIndex,
                isActive: true
            },
            include: {
                country: true,
                genres: true,
                actors: true
            }

        })
        return movie
    }

    async getAllMoviesRandom() {
        const movies = await this.prisma.$queryRaw`
        SELECT *
        FROM Movie
        ORDER BY RAND()
    `;

        return movies;
    }

    // Lấy những phim có lượt yêu thích nhiều nhất  
    async getMoviesFavorite() {
        const favoriteMovies = await this.prisma.favorite.groupBy({
            by: ['movieId'],
            _count: {
                movieId: true,
            },
            having: {
                movieId: {
                    _count: {
                        gte: 1,
                    },
                },
            },
        });


        const movieIds = favoriteMovies.map(
            (item) => item.movieId
        );

        if (movieIds.length === 0) {
            return [];
        }

        const movies = await this.prisma.movie.findMany({
            where: {
                id: {
                    in: movieIds,
                },
            },
            include: {
                country: true,
                genres: true,
                actors: true,
            },
        });


        const result = movies.map((movie) => {
            const favorite = favoriteMovies.find(
                (item) => item.movieId === movie.id
            );

            return {
                ...movie,
                favoriteCount: favorite?._count.movieId || 0,
            };
        });

        return result;
    }
}

