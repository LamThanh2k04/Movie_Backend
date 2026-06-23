import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateActorDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Tên diễn viên không được để trống" })
    @IsString({ message: 'Tên diễn viên phải là chuỗi' })
    name!: string

    @IsOptional()
    @IsDateString({}, { message: "Ngày sinh phải đúng định dạng" })
    dateOfbirth?: string

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Tên khác của diễn viên không được để trống" })
    @IsString({ message: 'Tên khác của diễn viên phải là chuỗi' })
    anotherName?: string

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Mô tả không được để trống" })
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description?: string

}