import { PostCreateDto } from '../dtos/post-create.dto';
import { PostListDto } from '../dtos/post-list.dto';
import { PostResponseDto } from '../dtos/post.response.dto';
import { PostUpdateDto } from '../dtos/post.update.dto';
import { PostBulkResponseDto } from '../dtos/post-bulk-response.dto';
import { PaginatedResult } from '../../../common/interfaces/query-builder.interface';
import { ApiBaseQueryDto } from '../../../common/dtos/api-query.dto';
import { PaginatedApiResponseDto } from '../../../common/dtos/api-response.dto';

export interface IPostService {
    // Create methods
    create(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto>;

    createPost(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto>;

    // Read methods
    findAll(queryParams: ApiBaseQueryDto): Promise<PaginatedApiResponseDto<PostResponseDto>>;

    findOne(id: string): Promise<PostResponseDto | null>;

    getPosts(query: PostListDto): Promise<PaginatedResult<PostResponseDto>>;

    // Update methods
    update(id: string, updatePostDto: PostUpdateDto): Promise<PostResponseDto>;

    updatePost(userId: string, id: string, updatePostDto: PostUpdateDto): Promise<PostResponseDto>;

    // Delete methods
    remove(id: string): Promise<any>;

    softDeletePosts(userId: string, postIds: string[]): Promise<PostBulkResponseDto>;
}
