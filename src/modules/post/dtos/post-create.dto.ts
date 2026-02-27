import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostCreateDto {
    @ApiProperty({
        description: 'Title of the post',
        example: 'My First Post',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Content of the post',
        example: 'This is the content of my first post.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'Array of image URLs associated with the post',
        example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
        ],
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}
