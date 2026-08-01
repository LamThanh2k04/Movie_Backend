import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class CheckFavoriteMovie {
    @Type(() => Number)
    @IsInt({ message: 'Phải là số nguyên' })
    movieId!: number
}