import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateActorDto } from './dto/createActor.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { UpdateActorDto } from './dto/updateActor.dto';
import { Prisma } from '@prisma/client';
import { GetAllActorsDto } from './dto/getAllActors.dto';

@Injectable()
export class ActorService {
    constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

    async createActor(createActorDto: CreateActorDto, avatar: UploadedFileType) {
        const { dateOfbirth } = createActorDto
        let avatarUrl: string | null = null
        let formatDateOfbirth: Date | null = null
        if (avatar) {
            const upload = await this.cloudinary.uploadImage(avatar, 'avatars', 'image')
            avatarUrl = upload.secure_url
        }
        if (dateOfbirth) {
            formatDateOfbirth = new Date(dateOfbirth)
        }
        const actor = await this.prisma.actor.create({
            data: {
                ...createActorDto,
                dateOfbirth: formatDateOfbirth,
                avatar: avatarUrl
            }
        })
        return actor
    }
    async updateActor(actorId: number, updateActorDto: UpdateActorDto, avatar: UploadedFileType) {
        const {dateOfbirth, anotherName} = updateActorDto

        const updateData: Prisma.ActorUpdateInput = {
            ...updateActorDto
        }

      if(anotherName) {
          const existingAnotherName = await this.prisma.actor.findFirst({
            where: {
                anotherName: anotherName,
                id: { not: actorId }
            }
        })
        if (existingAnotherName) {
            throw new ConflictException('Tên khác diễn viên đã tồn tại')
        }
      }
        if (avatar) {
            const upload = await this.cloudinary.uploadImage(avatar, 'avatars', 'image')
            updateData.avatar = upload.secure_url
        }
        if (dateOfbirth) {
            updateData.dateOfbirth = new Date(dateOfbirth)
        }
        const updateActor = await this.prisma.actor.update({
            where: {
                id: actorId
            },
            data: updateData
        })
        return updateActor
    }
    async updateActorStatus(actorId: number) {
        const actor = await this.prisma.country.findUnique({
            where: { id: actorId }
        })
        if (!actor) {
            throw new NotFoundException('Không tìm thấy diễn viên')
        }

        await this.prisma.actor.update({
            where: {
                id: actorId
            },
            data: {
                isActive: !actor.isActive
            }
        })
    }
    async getAllActors(getAllActorsDto: GetAllActorsDto) {
        const { search, page } = getAllActorsDto
        const limit = 5
        const skip = (page - 1) * limit
        const whereCondition = {
            ...(search ? {
                OR: [
                    {
                        name: {
                            contains: search
                        }
                    },
                    {
                        anotherName: {
                            contains: search
                        }
                    }
                ]
            }: {})
        }
        const [actors,totalActors] = await this.prisma.$transaction([
            this.prisma.actor.findMany({
                where : whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'}
            }),
            this.prisma.actor.count({
                where : whereCondition
            })
        ])
        return {
            actors : actors,
            pagination : {
                page: page,
                limit : limit,
                totalActors : totalActors,
                totalPages : Math.ceil(totalActors/limit)
            }
        }
    }
    async getAllActorsSimple() {
        const actors = await this.prisma.actor.findMany({
            where : {
                isActive : true
            },
            select : {
                id : true,
                name : true,
                avatar : true,
            }
        })
        return actors
    }

}
