import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateGenreDto} from './dto/createGenre.dto';
import { UpdateGenreDto } from './dto/updateGenre.dto';
import { Prisma } from '@prisma/client';
import { GetAllGenresDto } from './dto/getAllGenres.dto';

@Injectable()
export class GenreService {
    constructor(private prisma: PrismaService) { }

    async createGenre(createGenreDto: CreateGenreDto) {
        const { name } = createGenreDto

        const existingName = await this.prisma.genre.findFirst({
            where: { name }
        })
        if (existingName) {
            throw new ConflictException('Tên này đã tồn tại')
        }
        const genre = await this.prisma.genre.create({
            data: {
                ...createGenreDto
            }
        })
        return genre
    }

    async updateGenre(genreId: number, updateGenreDto: UpdateGenreDto) {
        const { name } = updateGenreDto
        const updateData: Prisma.GenreUpdateInput = {
            ...updateGenreDto
        }

        if (name) {
            const existingName = await this.prisma.genre.findFirst({
                where: {
                    name: name,
                    id: { not: genreId }
                },
            })
            if (existingName) {
                throw new ConflictException('Tên đã tồn tại')
            }
        }
        const updateGenre = await this.prisma.genre.update({
            where: {
                id: genreId
            },
            data: updateData
        })
        return updateGenre
    }

    async updateGenreStatus(genreId: number) {
        const genre = await this.prisma.genre.findUnique({
            where: {
                id: genreId
            }
        })
        if (!genre) {
            throw new NotFoundException('Thể loại không tồn tại')
        }
        await this.prisma.genre.update({
            where: {
                id: genreId
            },
            data: {
                isActive: !genre.isActive
            }
        })
    }

    async getAllGenres(getAllGenresDto: GetAllGenresDto) {
        const { search, page } = getAllGenresDto
        const limit = 5
        const skip = (page - 1) * limit
        const whereCondition = {
            ...(search ? {
                name: {
                    contains: search
                }
            } : {})
        }

        const [genres, totalGenres] = await this.prisma.$transaction([
            this.prisma.genre.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.genre.count({
                where: whereCondition
            })
        ])
        return {
            genres: genres,
            pagination: {
                page: page,
                limit: limit,
                totalGenres: totalGenres,
                totalPages: Math.ceil(totalGenres / limit)
            }
        }
    }
}
