import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PostCreateDto } from '../dtos/post-create.dto';
import { PostListDto } from '../dtos/post-list.dto';
import { PostResponseDto } from '../dtos/post.response.dto';
import { PostUpdateDto } from '../dtos/post.update.dto';
import { PostBulkResponseDto } from '../dtos/post-bulk-response.dto';
import { IPostService } from '../interfaces/post-service.interface';
import { PostMappingService } from './post-mapping.service';

import { DatabaseService } from '../../../common/services/database.service';
import { QueryBuilderService } from '../../../common/services/query-builder.service';
import { ApiBaseQueryDto } from '../../../common/dtos/api-query.dto';
import { PaginatedApiResponseDto } from '../../../common/dtos/api-response.dto';
import { PaginatedResult } from '../../../common/interfaces/query-builder.interface';

@Injectable()
export class PostService implements IPostService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly postMappingService: PostMappingService,
        private readonly queryBuilderService: QueryBuilderService,
    ) {}

    async create(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto> {
        const post = await this.databaseService.post.create({
            data: {
                ...createPostDto,
                createdBy: userId,
            },
        });

        return this.postMappingService.mapToResponse(post);
    }

    async createPost(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto> {
        const post = await this.databaseService.post.create({
            data: {
                title: createPostDto.title,
                content: createPostDto.content,
                images: createPostDto.images ?? [],
                createdBy: userId,
            },
        });

        return this.postMappingService.enrichPostData(post);
    }

    async findAll(queryParams: ApiBaseQueryDto): Promise<PaginatedApiResponseDto<PostResponseDto>> {
        const queryOptions = {
            model: 'post',
            dto: queryParams,
            searchFields: ['title', 'content'],
        };

        const result = await this.queryBuilderService.findManyWithPagination(queryOptions);

        return this.postMappingService.mapToListResponse(
            result.items as any[],
            result.meta.total,
            queryParams,
        );
    }

    async findOne(id: string): Promise<PostResponseDto | null> {
        const post = await this.databaseService.post.findUnique({
            where: { id },
        });

        if (!post) {
            return null;
        }

        return this.postMappingService.mapToResponse(post);
    }

    async update(id: string, updatePostDto: PostUpdateDto): Promise<PostResponseDto> {
        const post = await this.databaseService.post.update({
            where: { id },
            data: updatePostDto,
        });

        return this.postMappingService.mapToResponse(post);
    }

    async remove(id: string): Promise<any> {
        return await this.databaseService.post.delete({
            where: { id },
        });
    }

    async getPosts(query: PostListDto): Promise<PaginatedResult<PostResponseDto>> {
        const { authorId, search, page = 1, limit = 10 } = query;

        const skip = (page - 1) * limit;
        const take = limit;

        const where: Prisma.PostWhereInput = {
            isDeleted: false,
            ...(authorId && { createdBy: authorId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [count, data] = await Promise.all([
            this.databaseService.post.count({ where }),
            this.databaseService.post.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
            items: await this.postMappingService.enrichPostsData(data),
            meta: {
                total: count,
                page,
                limit: take,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async updatePost(
        userId: string,
        id: string,
        updatePostDto: PostUpdateDto,
    ): Promise<PostResponseDto> {
        const updatedPost = await this.databaseService.post.update({
            where: { id },
            data: { ...updatePostDto, updatedBy: userId },
        });

        return this.postMappingService.enrichPostData(updatedPost);
    }

    async softDeletePosts(userId: string, postIds: string[]): Promise<PostBulkResponseDto> {
        const result = await this.databaseService.post.updateMany({
            where: {
                id: {
                    in: postIds,
                },
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
            },
        });

        return {
            count: result.count,
        };
    }
}
