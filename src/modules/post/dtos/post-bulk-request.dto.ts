import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
} from 'class-validator';

export class PostBulkRequestDto {
    @ApiProperty({
        description: 'Post ids',
        example: [faker.string.uuid()],
    })
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @ArrayUnique()
    ids: string[];
}
