import {Transform} from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
export class RegisterDto {

    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({message : "Tên không được để trống"})
    @IsString({message : "Tên phải là một chuỗi"})
    name! : string

    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Email không được để trống" })
    @IsString({ message: "Email phải là chuỗi" })
    @IsEmail({}, { message: "Email không hợp lệ" })
    email!: string;

    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: "Mật khẩu không được để trống" })
    @IsString({ message: "Mật khẩu phải là chuỗi" })
    @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    password!: string;
}