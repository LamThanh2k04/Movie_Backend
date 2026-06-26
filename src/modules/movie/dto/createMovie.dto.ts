import { MovieType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateMovieDto {

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Tên phim không được để trống' })
    @IsString({ message: "Tên phim phải là chuỗi" })
    name!: string

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Mô tả phim không được để trống' })
    @IsString({ message: "Mô tả phim phim phải là chuỗi" })
    description?: string

    @IsEnum(MovieType, { message: 'Loại phim không hợp lệ' })
    type!: MovieType

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Số sao phải là số' })
    @Min(0, { message: 'Số sao tối thiểu là 0' })
    @Max(5, { message: 'Số sao tối đa là 5' })
    star?: number;

    @Type(() => Number)
    @IsInt({ message: 'Năm sản xuất phải là số nguyên' })
    releaseYear!: number


    @Type(() => Number)
    @IsInt({ message: 'Id quốc gia phải là số nguyên' })
    countryId!: number

    @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
    @IsArray({message: 'Phải là mảng'})
    @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 thể loại' })
    @IsInt({ each: true, message: 'Id các thể loại phải là số nguyên' })
    genreIds!: number[];

    @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
    @IsArray({message: 'Phải là mảng'})
    @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 diễn viên' })
    @IsInt({ each: true, message: 'Id các diễn viên phải là số nguyên' })
    actorIds!: number[];


}