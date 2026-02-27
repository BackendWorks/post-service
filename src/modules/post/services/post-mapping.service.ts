import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';

import { PostResponseDto } from '../dtos/post.response.dto';
import { ROLE } from '../../../common/enums/app.enum';
import { ApiBaseQueryDto } from '../../../common/dtos/api-query.dto';
import { PaginatedApiResponseDto } from '../../../common/dtos/api-response.dto';

@Injectable()
export class PostMappingService {
    mapToResponse(post: Post): PostResponseDto {
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            createdBy: {
                id: post.createdBy,
                email: '', // This should be fetched from auth service
                firstName: '',
                lastName: '',
                isVerified: false,
                role: ROLE.USER,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
            images: post.images || [],
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            isDeleted: post.isDeleted || false,
            // Optional fields
            ...(post.updatedBy && {
                updatedBy: {
                    id: post.updatedBy,
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                },
            }),
            ...(post.deletedBy && {
                deletedBy: {
                    id: post.deletedBy,
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                },
            }),
            ...(post.deletedAt && { deletedAt: post.deletedAt }),
        };
    }

    mapToListResponse(
        posts: Post[],
        total: number,
        params: ApiBaseQueryDto,
    ): PaginatedApiResponseDto<PostResponseDto> {
        const { page = 1, limit = 10 } = params;
        const totalPages = Math.ceil(total / limit);

        return {
            statusCode: 200,
            timestamp: new Date().toISOString(),
            message: 'Posts retrieved successfully',
            data: posts.map(post => this.mapToResponse(post)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    // Legacy methods for backward compatibility
    async enrichPostData(post: Post): Promise<PostResponseDto> {
        return this.mapToResponse(post);
    }

    async enrichPostsData(posts: Post[]): Promise<PostResponseDto[]> {
        return posts.map(post => this.mapToResponse(post));
    }
}
