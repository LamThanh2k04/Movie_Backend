import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCountryDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Tên thể loại không được để trống" })
    @IsString({ message: 'Tên thể loại phải là chuỗi' })
    name!: string
}