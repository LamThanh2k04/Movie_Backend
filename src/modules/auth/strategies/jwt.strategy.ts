import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/common/prisma/prisma.service";
import { JwtPayLoad } from "src/common/types/jwtPayload.type";


export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET')!
        })
    }

    async validate(payload: JwtPayLoad) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        if(!user) {
            throw new NotFoundException('Người dùng không tồn tại')
        }
        return {
            id : user.id
        }
    }
}