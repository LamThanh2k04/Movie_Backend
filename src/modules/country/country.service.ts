import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCountryDto } from './dto/createCountry.dto';
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UpdateCountryDto } from './dto/updateCountry.dto';
import { Prisma } from '@prisma/client';
import { GetAllCountriesDto } from './dto/getAllCountries.dto';

@Injectable()
export class CountryService {
    constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) { }

    async createCountry(createCountryDto: CreateCountryDto, image: UploadedFileType) {
        const { name } = createCountryDto


        const existingName = await this.prisma.country.findUnique({
            where: { name }
        })
        if (existingName) {
            throw new ConflictException('Tên quốc gia đã tồn tại')
        }
        const upload = await this.cloudinary.uploadImage(image, 'country', 'image')

        const country = await this.prisma.country.create({
            data: {
                ...createCountryDto,
                image: upload.secure_url
            }
        })
        return country
    }

    async updateCountry(countryId: number, updateCountryDto: UpdateCountryDto, image: UploadedFileType) {
        const { name } = updateCountryDto

        const updateData: Prisma.CountryUpdateInput = {
            ...updateCountryDto
        }

        if (name) {
            const existingName = await this.prisma.country.findFirst({
                where: {
                    name,
                    id: { not: countryId }
                },
            })
            if (existingName) {
                throw new ConflictException('Tên quốc gia đã tồn tại')
            }
        }
        if (image) {
            const upload = await this.cloudinary.uploadImage(image, 'country', 'image')
            updateData.image = upload.secure_url
        }
        const updateCountry = await this.prisma.country.update({
            where: { id: countryId },
            data: {
                ...updateData
            }
        })
        return updateCountry
    }

    async updateCountryStatus(countryId: number) {
        const country = await this.prisma.country.findUnique({
            where: { id: countryId }
        })
        if (!country) {
            throw new NotFoundException('Không tìm thấy quốc gia')
        }

        await this.prisma.country.update({
            where: {
                id: countryId
            },
            data: {
                isActive: !country.isActive
            }
        })
    }

    async getAllCountries(getAllCountriesDto: GetAllCountriesDto) {
        const { search, page } = getAllCountriesDto
        const limit = 5
        const skip = (page - 1) * limit

        const whereCondition = {
            ...(search ? {
                name: {
                    contains: search
                }
            } : {})
        }
        const [countries, totalCountries] = await this.prisma.$transaction([
            this.prisma.country.findMany({
                where: whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'}
            }),
            this.prisma.country.count({
                where : whereCondition
            })
        ])
        return {
            countries : countries,
            pagination : {
                page : page,
                limit : limit,
                totalCountries : totalCountries,
                totalPages: Math.ceil(totalCountries/limit)
            }
        }
    }

    async getAllCountriesSimple() {
        const countries = await this.prisma.country.findMany({
            where : {
                isActive : true
            },
            select : {
                id : true,
                name : true,
                image : true
            }
        })
        return countries
    }
}
