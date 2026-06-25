import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Min } from "class-validator"

export class GetAllMoviesDto {

    @IsOptional()
    @IsString({message : 'Tìm kiếm phải là chuỗi'})
    search?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt({message : 'Page phải là số nguyên'})
    @Min(1, { message: "Page phải lớn hơn hoặc bằng 1" })
    page: number = 1
}