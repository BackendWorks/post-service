import { Injectable } from '@nestjs/common';

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
        const post = await this.databaseService.postRepository.create({
            ...createPostDto,
            createdBy: userId,
        });

        return this.postMappingService.mapToResponse(post);
    }

    async createPost(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto> {
        const post = await this.databaseService.postRepository.create({
            title: createPostDto.title,
            content: createPostDto.content,
            images: createPostDto.images ?? [],
            createdBy: userId,
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
        const post = await this.databaseService.postRepository.findById(id);

        if (!post) {
            return null;
        }

        return this.postMappingService.mapToResponse(post);
    }

    async update(id: string, updatePostDto: PostUpdateDto): Promise<PostResponseDto> {
        const post = await this.databaseService.postRepository.update(id, updatePostDto);

        return this.postMappingService.mapToResponse(post);
    }

    async remove(id: string): Promise<any> {
        return this.databaseService.postRepository.softDelete(id);
    }

    async getPosts(query: PostListDto): Promise<PaginatedResult<PostResponseDto>> {
        const { authorId, search, page = 1, limit = 10 } = query;

        const customFilters: Record<string, unknown> = { isDeleted: false };
        if (authorId) customFilters['createdBy'] = authorId;

        const result = await this.databaseService.postRepository.findMany({
            page,
            limit,
            search,
            searchFields: ['title', 'content'],
            sortBy: 'createdAt',
            sortOrder: 'desc',
            customFilters,
        });

        return {
            items: await this.postMappingService.enrichPostsData(result.items as any[]),
            meta: result.meta,
        };
    }

    async updatePost(
        userId: string,
        id: string,
        updatePostDto: PostUpdateDto,
    ): Promise<PostResponseDto> {
        const updatedPost = await this.databaseService.postRepository.update(id, {
            ...updatePostDto,
            updatedBy: userId,
        });

        return this.postMappingService.enrichPostData(updatedPost);
    }

    async softDeletePosts(userId: string, postIds: string[]): Promise<PostBulkResponseDto> {
        const count = await this.databaseService.postRepository.softDeleteMany(postIds, userId);

        return { count };
    }
}
