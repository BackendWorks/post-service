import { GrpcController, GrpcMethod, GrpcException } from 'nestjs-grpc';
import {
    CreatePostRequest,
    CreatePostResponse,
    GetPostRequest,
    GetPostResponse,
    GetPostsRequest,
    GetPostsResponse,
    UpdatePostRequest,
    UpdatePostResponse,
    DeletePostRequest,
    DeletePostResponse,
} from '../generated/post';
import { PostService } from '../modules/post/services/post.service';
import { PostCreateDto } from '../modules/post/dtos/post-create.dto';
import { PostListDto } from '../modules/post/dtos/post-list.dto';
import { PostUpdateDto } from '../modules/post/dtos/post.update.dto';

@GrpcController('PostService')
export class PostGrpcController {
    constructor(private readonly postService: PostService) {}

    @GrpcMethod('CreatePost')
    async createPost(request: CreatePostRequest): Promise<CreatePostResponse> {
        try {
            if (!request.title || !request.content || !request.authorId) {
                throw GrpcException.invalidArgument('Title, content, and authorId are required');
            }

            const createPostDto: PostCreateDto = {
                title: request.title,
                content: request.content,
            };

            const post = await this.postService.createPost(createPostDto, request.authorId);

            return {
                success: true,
                payload: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    authorId: request.authorId,
                    createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
                    updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
                },
            };
        } catch (error) {
            if (error instanceof GrpcException) {
                throw error;
            }
            throw GrpcException.internal('Failed to create post', { error: error.message });
        }
    }

    @GrpcMethod('GetPost')
    async getPost(request: GetPostRequest): Promise<GetPostResponse> {
        try {
            if (!request.id) {
                throw GrpcException.invalidArgument('Post ID is required');
            }

            const post = await this.postService.findOne(request.id);

            if (!post) {
                throw GrpcException.notFound('Post not found');
            }

            return {
                success: true,
                payload: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    authorId:
                        typeof post.createdBy === 'string'
                            ? post.createdBy
                            : post.createdBy?.id || '',
                    createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
                    updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
                },
            };
        } catch (error) {
            if (error instanceof GrpcException) {
                throw error;
            }
            throw GrpcException.internal('Failed to get post', { error: error.message });
        }
    }

    @GrpcMethod('GetPosts')
    async getPosts(request: GetPostsRequest): Promise<GetPostsResponse> {
        try {
            const queryDto: PostListDto = {
                page: request.page || 1,
                limit: request.limit || 10,
                search: request.search,
            };

            const result = await this.postService.getPosts(queryDto);

            const postsPayload = result.items.map(post => ({
                id: post.id,
                title: post.title,
                content: post.content,
                authorId:
                    typeof post.createdBy === 'string' ? post.createdBy : post.createdBy?.id || '',
                createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
            }));

            return {
                success: true,
                payload: {
                    posts: postsPayload,
                    total: result.meta.total,
                    page: result.meta.page,
                    limit: result.meta.limit,
                },
            };
        } catch (error) {
            if (error instanceof GrpcException) {
                throw error;
            }
            throw GrpcException.internal('Failed to get posts', { error: error.message });
        }
    }

    @GrpcMethod('UpdatePost')
    async updatePost(request: UpdatePostRequest): Promise<UpdatePostResponse> {
        try {
            if (!request.id) {
                throw GrpcException.invalidArgument('Post ID is required');
            }

            const updatePostDto: PostUpdateDto = {};
            if (request.title) updatePostDto.title = request.title;
            if (request.content) updatePostDto.content = request.content;

            const post = await this.postService.update(request.id, updatePostDto);

            return {
                success: true,
                payload: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    authorId:
                        typeof post.createdBy === 'string'
                            ? post.createdBy
                            : post.createdBy?.id || '',
                    createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
                    updatedAt: post.updatedAt?.toISOString() || new Date().toISOString(),
                },
            };
        } catch (error) {
            if (error instanceof GrpcException) {
                throw error;
            }
            throw GrpcException.internal('Failed to update post', { error: error.message });
        }
    }

    @GrpcMethod('DeletePost')
    async deletePost(request: DeletePostRequest): Promise<DeletePostResponse> {
        try {
            if (!request.id) {
                throw GrpcException.invalidArgument('Post ID is required');
            }

            await this.postService.remove(request.id);

            return {
                success: true,
                payload: {
                    id: request.id,
                    deleted: true,
                },
            };
        } catch (error) {
            if (error instanceof GrpcException) {
                throw error;
            }
            throw GrpcException.internal('Failed to delete post', { error: error.message });
        }
    }
}
