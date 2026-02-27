import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './post-user.response.dto';

export class PostResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the post',
        example: faker.string.uuid(),
    })
    id: string;

    @ApiProperty({
        description: 'Title of the post',
        example: 'My First Post',
    })
    title: string;

    @ApiProperty({
        description: 'Content of the post',
        example: 'This is the content of my first post.',
    })
    content: string;

    @ApiProperty({
        description: 'User who created the post',
        type: UserResponseDto,
    })
    createdBy: UserResponseDto;

    @ApiProperty({
        description: 'Array of image URLs associated with the post',
        example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
        ],
        type: [String],
    })
    images: string[];

    @ApiProperty({
        description: 'The date and time when the post was created',
        example: '2024-02-23T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'The user who last updated the post',
        type: UserResponseDto,
        required: false,
    })
    updatedBy?: UserResponseDto;

    @ApiProperty({
        description: 'The date and time when the post was last updated',
        example: '2024-02-23T12:00:00Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'The user who deleted the post, if applicable',
        type: UserResponseDto,
        required: false,
    })
    deletedBy?: UserResponseDto;

    @ApiProperty({
        description:
            'The date and time when the post was deleted, if applicable',
        example: '2024-02-23T12:00:00Z',
        required: false,
    })
    deletedAt?: Date | null;

    @ApiProperty({
        description: 'Indicates if the post is marked as deleted',
        example: false,
    })
    isDeleted: boolean;
}
