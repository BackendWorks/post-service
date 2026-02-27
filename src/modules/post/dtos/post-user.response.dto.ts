import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

import { ROLE } from '../../../common/enums/app.enum';

export class UserResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: faker.string.uuid(),
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: faker.internet.email(),
    })
    email: string;

    @ApiProperty({
        description: 'Username of the user',
        example: faker.internet.username(),
        required: false,
    })
    username?: string;

    @ApiProperty({
        description: 'First name of the user',
        example: faker.person.firstName(),
        required: false,
    })
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: faker.person.lastName(),
        required: false,
    })
    lastName?: string;

    @ApiProperty({
        description: 'Profile avatar URL',
        example: faker.image.avatar(),
        required: false,
    })
    avatar?: string;

    @ApiProperty({
        description: 'Indicates if the user is verified',
        example: faker.datatype.boolean(),
    })
    isVerified: boolean;

    @ApiProperty({
        description: 'Phone number of the user',
        example: faker.phone.number(),
        required: false,
    })
    phone?: string;

    @ApiProperty({
        description: 'Role of the user',
        example: ROLE.USER,
    })
    role: ROLE;

    @ApiProperty({
        description: 'User creation timestamp',
        example: faker.date.past().toISOString(),
    })
    createdAt: Date;

    @ApiProperty({
        description: 'User last updated timestamp',
        example: faker.date.recent().toISOString(),
    })
    updatedAt: Date;
}
