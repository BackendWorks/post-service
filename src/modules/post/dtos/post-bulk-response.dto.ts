import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class PostBulkResponseDto {
    @ApiProperty({
        description: 'Count of posts',
        example: 1,
    })
    count: number;
}
