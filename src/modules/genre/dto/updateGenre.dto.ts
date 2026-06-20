import { PartialType } from "@nestjs/mapped-types";
import { createGenreDto } from "./createGenre.dto";

export class updateGenreDto extends PartialType(createGenreDto) {}