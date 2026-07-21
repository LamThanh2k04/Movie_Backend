import { IsOptional, IsString } from "class-validator";

export class GetMoviesBySearch {
        @IsOptional()
        @IsString({message : 'Tìm kiếm phải là chuỗi'})
        search!: string
}