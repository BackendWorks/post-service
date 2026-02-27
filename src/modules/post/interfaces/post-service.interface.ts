import { PostCreateDto } from '../dtos/post-create.dto';
import { PostListDto } from '../dtos/post-list.dto';
import { PostResponseDto } from '../dtos/post.response.dto';
import { PostUpdateDto } from '../dtos/post.update.dto';
import { PostBulkResponseDto } from '../dtos/post-bulk-response.dto';
import { PaginatedResult } from '../../../common/interfaces/query-builder.interface';

export interface IPostService {
    createPost(createPostDto: PostCreateDto, userId: string): Promise<PostResponseDto>;

    findOne(id: string): Promise<PostResponseDto | null>;

    getPosts(query: PostListDto): Promise<PaginatedResult<PostResponseDto>>;

    updatePost(userId: string, id: string, updatePostDto: PostUpdateDto): Promise<PostResponseDto>;

    remove(id: string): Promise<any>;

    softDeletePosts(userId: string, postIds: string[]): Promise<PostBulkResponseDto>;
}
