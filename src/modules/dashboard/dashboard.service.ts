import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FavoriteChartDto } from './dto/favoriteChart.dto';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getAllOverView() {

        const [totalUser, totalMovie, totalGenre, totalCountry] = await this.prisma.$transaction([
            this.prisma.user.count({
                where: {
                    role: 'USER',
                    isActive: true
                }
            }),
            this.prisma.movie.count({
                where: {
                    isActive: true
                }
            }),
            this.prisma.genre.count({
                where: {
                    isActive: true
                }
            }),
            this.prisma.genre.count({
                where: {
                    isActive: true
                }
            }),
            this.prisma.country.count({
                where: {
                    isActive: true
                }
            })
        ])

        const total = {
            totalUser: totalUser,
            totalMovie: totalMovie,
            totalGenre: totalGenre,
            totalCountry: totalCountry
        }
        return total
    }

    async getMovieFavoriteUserChart() {
        const movie = await this.prisma.movie.findMany({
            include: {
                _count: {
                    select: {
                        Favorite: true
                    }
                }
            },
            orderBy: {
                Favorite: {
                    _count: 'desc'
                }
            },
            take: 5
        })
        return movie
    }

    async getFavoriteChart(favoriteChartDto : FavoriteChartDto) {
        const selectedYear = favoriteChartDto.year ?? new Date().getFullYear(); // Nếu year null hoặc undefined thì dùng bên phải

        const result = await this.prisma.$queryRaw<
            { month: number; favoriteCount: bigint }[]
        >`
       SELECT
       MONTH(createdAt) AS month,
       COUNT(*) AS favoriteCount
       FROM Favorite
       WHERE YEAR(createdAt) = ${selectedYear}
       GROUP BY MONTH(createdAt)
       ORDER BY MONTH(createdAt)
       `;

        const data = Array.from({ length: 12 }, (_, index) => ({
            month: index + 1,
            favoriteCount: 0,
        }));

        result.forEach(item => {
            data[item.month - 1].favoriteCount = Number(item.favoriteCount);
        });

        return data;
    }
}
