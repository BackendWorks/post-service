import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { faker } from '@faker-js/faker';

export class PostListDto {
    @ApiProperty({
        description: 'Filter posts by author ID',
        required: false,
        example: faker.string.uuid(),
    })
    @IsString()
    @Type(() => String)
    @IsOptional()
    authorId?: string;

    @ApiProperty({
        description: 'Search posts by title',
        required: false,
        example: 'search term',
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Number of posts to page',
        required: false,
        example: 1,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    page: number;

    @ApiProperty({
        description: 'Number of posts to limit',
        required: false,
        example: 10,
    })
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    limit: number;
}
