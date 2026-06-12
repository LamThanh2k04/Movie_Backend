import { Injectable, OnModuleInit } from '@nestjs/common';
import {PrismaClient} from '@prisma/client'
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit  {

    async onModuleInit() {
       try {
        await this.$connect();
        console.log('Prisma: Kết nối thành công')
       } catch (err) {
        console.error('Prisma: Lỗi kết nối', err)
       }
    }
}
