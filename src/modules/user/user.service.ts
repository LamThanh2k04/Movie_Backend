import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/updateUser.dto';
import { Prisma, Role } from '@prisma/client';
import { GetAllUsersDto } from './dto/getAllUsers.dto';
import { AddFavoriteMovieDto } from './dto/addFavoriteMovie.dto';
import { RemoveFavoriteMovieDto } from './dto/removeFavoriteMovie.dto';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService
    ) { }

    async createUser(createUserDto: CreateUserDto, avatar: UploadedFileType) {
        const { email, password } = createUserDto
        let avatarUrl: string | null = null

        const existingEmail = await this.prisma.user.findUnique({
            where: { email }
        })

        if (existingEmail) {
            throw new ConflictException('Email đã tồn tại')
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        if (avatar) {
            const uploaded = await this.cloudinary.uploadImage(avatar, 'avatars', 'image')
            avatarUrl = uploaded.secure_url
        }
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                avatar: avatarUrl
            }
        })
        return user
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto, avatar: UploadedFileType) {
        const { email, password } = updateUserDto

        const updateData: Prisma.UserUpdateInput = { // Prisma.UserUpdateInput là TypeScript type được Prisma tự sinh ra dựa trên model User
            ...updateUserDto
        }

        if (email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    email: email,
                    id: {
                        not: userId
                    }
                }
            })
            if (existingEmail) {
                throw new ConflictException('Email đã tồn tại')
            }
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }
        if (avatar) {
            const uploaded = await this.cloudinary.uploadImage(avatar, 'avatars', 'image')
            updateData.avatar = uploaded.secure_url
        }
        const updateUser = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: updateData
        })
        return updateUser
    }

    async getAllUsers(getAllUsersDto: GetAllUsersDto) {
        const { search, page } = getAllUsersDto
        const limit = 5
        const skip = (page - 1) * limit

        const whereCondition = {
            role: Role.USER,
            ...(search ? {
                OR: [
                    {
                        name: {
                            contains: search
                        }
                    },
                    {
                        email: {
                            contains: search
                        }
                    }
                ]
            } : {})
        }

        const [users, totalUsers] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.user.count({
                where: whereCondition
            })
        ])
        return {
            users: users,
            pagination: {
                page: page,
                limit: limit,
                totalUsers: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)

            }
        }
    }

    async updateUserStatus(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này')
        }
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isActive: !user.isActive
            }
        })
    }

    async addFavoriteMovie(userId: number, addFavoriteMovieDto: AddFavoriteMovieDto) {
        const { movieId } = addFavoriteMovieDto

        const [movie, favorite] = await this.prisma.$transaction([
            this.prisma.movie.findUnique({
                where: {
                    id: movieId
                }
            }),
            this.prisma.favorite.findUnique({
                where: {
                    userId_movieId: {
                        userId,
                        movieId
                    }
                }
            })
        ])
        if (!movie) {
            throw new NotFoundException('Không tìm thấy phim này')
        }
        if (favorite) {
            throw new ConflictException('Phim đã có trong danh sách yêu thích');
        }


        await this.prisma.favorite.create({
            data: {
                userId: userId,
                movieId: movieId
            }
        })
    }

    async removeFavoriteMovie(userId: number, removeFavoriteMovieDto: RemoveFavoriteMovieDto) {
        const { movieId } = removeFavoriteMovieDto

        const [movie, favorite] = await this.prisma.$transaction([
            this.prisma.movie.findUnique({
                where: {
                    id: movieId
                }
            }),
            this.prisma.favorite.findUnique({
                where: {
                    userId_movieId: {
                        userId,
                        movieId
                    }
                }
            })
        ])
        if (!movie) {
            throw new NotFoundException('Không tìm thấy phim này')
        }
        if (!favorite) {
            throw new NotFoundException('Phim chưa có trong danh sách yêu thích');
        }
        await this.prisma.favorite.delete({
            where: {
                userId_movieId: {
                    userId: userId,
                    movieId: movieId,
                }
            }
        })
    }

    async getFavoriteMovieUser(userId: number) {
        const favorite = await this.prisma.favorite.findMany({
            where: {
                userId: userId
            },
            include: {
                movie: {
                    include: {
                        country: true,
                        genres: true,
                        actors: true
                    }
                }
            }
        })
        return favorite

    }
}
