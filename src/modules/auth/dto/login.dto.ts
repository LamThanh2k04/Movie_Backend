import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";


export class LoginDto {
    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({message: 'Email không được để trống'})
    @IsEmail({}, {message: 'Email không hợp lệ'})
    email!: string;

    @Transform(({value}) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({message: 'Mật khẩu không được để trống'})
    password!: string;
}