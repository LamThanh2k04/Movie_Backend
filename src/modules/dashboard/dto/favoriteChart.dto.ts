import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";


export class FavoriteChartDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({message : 'Năm phải là số nguyên'})
    @Min(2000,{message: 'tối thiểu năm là 2000'})
    year? : string
}