import { Type } from "class-transformer";
import { IsInt } from "class-validator";


export class AddFavoriteMovieDto {

    @Type(() => Number)
    @IsInt({ message: 'Phải là số nguyên' })
    movieId!: number
}