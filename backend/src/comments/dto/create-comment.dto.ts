import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  postId!: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}