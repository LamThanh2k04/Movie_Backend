import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'
import { UploadedFileType } from 'src/common/types/uploadedFile.type';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor
        (
            private prisma: PrismaService,
            private cloudinary: CloudinaryService,
            private jwt: JwtService
        ) { }

    async register(registerDto: RegisterDto, file: UploadedFileType) {
        const { email, password } = registerDto
        let avatarUrl: string | null = null
        const existingEmail = await this.prisma.user.findUnique({
            where: { email }
        })
        if (existingEmail) {
            throw new ConflictException("Email đã tồn tại")
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        if (file) {
            const uploaded = await this.cloudinary.uploadImage(file, 'avatars', 'image')
            avatarUrl = uploaded.secure_url
        }

        const user = await this.prisma.user.create({
            data: {
                ...registerDto,
                password: hashedPassword,
                avatar: avatarUrl
            }
        })
        return user
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto

        const user = await this.prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng")
        }

        const isMatchedPassword = await bcrypt.compare(password, user.password)
        if (!isMatchedPassword) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng")
        }

        const payload = {
            sub: user.id,
            role: user.role
        }
        const { password: _, ...safeUser } = user;
        const token = await this.jwt.signAsync(payload)
        return { 
            accessToken: token,
            user: safeUser
         }
    }
}
