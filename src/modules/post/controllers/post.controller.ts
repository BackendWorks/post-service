import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PostService } from '../services/post.service';
import { PostCreateDto } from '../dtos/post-create.dto';
import { PostUpdateDto } from '../dtos/post.update.dto';
import { PostResponseDto } from '../dtos/post.response.dto';
import { PostBulkResponseDto } from '../dtos/post-bulk-response.dto';
import { PostListDto } from '../dtos/post-list.dto';
import { PostBulkRequestDto } from '../dtos/post-bulk-request.dto';

import { MessageKey } from '../../../common/decorators/message.decorator';
import { SwaggerPaginatedResponse, SwaggerResponse } from 'src/common/dtos/api-response.dto';
import { AuthUser } from '../../../common/decorators/auth-user.decorator';
import { PaginatedResult } from '../../../common/interfaces/query-builder.interface';
import { IAuthUserPayload } from '@/common/interfaces/request.interface';

@ApiTags('posts')
@Controller({
    version: '1',
    path: '/post',
})
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    @ApiBearerAuth('accessToken')
    @MessageKey('post.success.created')
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Post created successfully',
        type: SwaggerResponse(PostResponseDto),
    })
    async createPost(
        @AuthUser() user: IAuthUserPayload,
        @Body() createPostDto: PostCreateDto,
    ): Promise<PostResponseDto> {
        return this.postService.createPost(createPostDto, user.id);
    }

    @Get()
    @ApiBearerAuth('accessToken')
    @MessageKey('post.success.listed')
    @ApiOperation({ summary: 'Get list of posts' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Posts retrieved successfully',
        type: SwaggerPaginatedResponse(PostResponseDto),
    })
    async getPosts(@Query() query: PostListDto): Promise<PaginatedResult<PostResponseDto>> {
        return this.postService.getPosts(query);
    }

    @Put(':id')
    @ApiBearerAuth('accessToken')
    @MessageKey('post.success.updated')
    @ApiOperation({ summary: 'Update post details' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Post updated successfully',
        type: SwaggerResponse(PostResponseDto),
    })
    async updatePost(
        @AuthUser() user: IAuthUserPayload,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePostDto: PostUpdateDto,
    ): Promise<PostResponseDto> {
        return this.postService.updatePost(user.id, id, updatePostDto);
    }

    @Delete('batch')
    @ApiBearerAuth('accessToken')
    @MessageKey('post.success.deleted')
    @ApiOperation({ summary: 'Batch delete posts' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Posts deleted successfully',
        type: SwaggerResponse(PostBulkResponseDto),
    })
    async softDeletePosts(
        @AuthUser() user: IAuthUserPayload,
        @Body() body: PostBulkRequestDto,
    ): Promise<PostBulkResponseDto> {
        return this.postService.softDeletePosts(user.id, body.ids);
    }
}
