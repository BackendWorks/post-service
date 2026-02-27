import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class PostUpdateDto {
    @ApiProperty({
        description: 'Title of the post',
        example: 'Updated Post Title',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: 'Content of the post',
        example: 'Updated content of the post',
        required: false,
    })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({
        description: 'Array of image URLs',
        example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
        ],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}
