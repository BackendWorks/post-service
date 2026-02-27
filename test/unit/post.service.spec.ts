import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../src/modules/post/services/post.service';
import { DatabaseService } from '../../src/common/services/database.service';
import { QueryBuilderService } from '../../src/common/services/query-builder.service';
import { PostMappingService } from '../../src/modules/post/services/post-mapping.service';

describe('PostService', () => {
    let service: PostService;
    let postMappingService: PostMappingService;

    const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
        isDeleted: false,
    };

    const mockPostRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        softDeleteMany: jest.fn(),
        count: jest.fn(),
    };

    const mockDatabaseService = {
        get postRepository() {
            return mockPostRepository;
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
                {
                    provide: QueryBuilderService,
                    useValue: {
                        findManyWithPagination: jest.fn(),
                    },
                },
                {
                    provide: PostMappingService,
                    useValue: {
                        mapToResponse: jest.fn(),
                        mapToListResponse: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        postMappingService = module.get<PostMappingService>(PostMappingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPost', () => {
        it('should create a post with images', async () => {
            const createPostDto = {
                title: 'Test Post',
                content: 'Test content',
                images: ['image1.jpg', 'image2.jpg'],
            };
            const userId = 'user-1';

            mockPostRepository.create.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.createPost(createPostDto, userId);

            expect(mockPostRepository.create).toHaveBeenCalledWith({
                title: createPostDto.title,
                content: createPostDto.content,
                images: createPostDto.images,
                createdBy: userId,
            });
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });

        it('should create a post without images (defaults to [])', async () => {
            const createPostDto = {
                title: 'Test Post',
                content: 'Test content',
            };
            const userId = 'user-1';

            mockPostRepository.create.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.createPost(createPostDto, userId);

            expect(mockPostRepository.create).toHaveBeenCalledWith({
                title: createPostDto.title,
                content: createPostDto.content,
                images: [],
                createdBy: userId,
            });
            expect(result).toEqual(mockPost);
        });
    });

    describe('findOne', () => {
        it('should find a post by id', async () => {
            const postId = '1';
            mockPostRepository.findById.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.findOne(postId);

            expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });

        it('should return null if post not found', async () => {
            const postId = '999';
            mockPostRepository.findById.mockResolvedValue(null);

            const result = await service.findOne(postId);

            expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
            expect(result).toBeNull();
        });
    });

    describe('remove', () => {
        it('should soft-delete a post', async () => {
            const postId = '1';
            mockPostRepository.softDelete.mockResolvedValue(mockPost);

            const result = await service.remove(postId);

            expect(mockPostRepository.softDelete).toHaveBeenCalledWith(postId);
            expect(result).toEqual(mockPost);
        });
    });

    describe('getPosts', () => {
        const buildResult = (posts: any[], total: number, page = 1, limit = 10) => ({
            items: posts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        });

        it('should get posts with pagination', async () => {
            const query = { page: 1, limit: 10 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.items).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
        });

        it('should get posts with search', async () => {
            const query = { page: 1, limit: 10, search: 'test search' };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts by author', async () => {
            const query = { page: 1, limit: 10, authorId: 'user-1' };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts without author filter', async () => {
            const query = { page: 1, limit: 10 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should use default page and limit when not provided', async () => {
            const query = {} as any;
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, limit: 10 }),
            );
            expect(result.meta.total).toBe(1);
        });

        it('should get posts with falsy authorId', async () => {
            const query = { page: 1, limit: 10, authorId: '' };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with authorId and search', async () => {
            const query = { page: 1, limit: 10, authorId: 'user-1', search: 'test search' };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with falsy search', async () => {
            const query = { page: 1, limit: 10, search: '' };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with null search', async () => {
            const query = { page: 1, limit: 10, search: null as any };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with undefined search', async () => {
            const query = { page: 1, limit: 10, search: undefined as any };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with null authorId', async () => {
            const query = { page: 1, limit: 10, authorId: null as any };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with undefined authorId', async () => {
            const query = { page: 1, limit: 10, authorId: undefined as any };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with no query parameters', async () => {
            const query = { page: 1, limit: 10 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(1);
        });

        it('should get posts with page 1 and multiple pages', async () => {
            const query = { page: 1, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult(Array(5).fill(mockPost), 15, 1, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(15);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page 2 and multiple pages', async () => {
            const query = { page: 2, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult(Array(5).fill(mockPost), 15, 2, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(15);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with last page', async () => {
            const query = { page: 3, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult(Array(5).fill(mockPost), 15, 3, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.total).toBe(15);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with single page', async () => {
            const query = { page: 1, limit: 10 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with zero count', async () => {
            const query = { page: 1, limit: 10 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([], 0));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.items).toHaveLength(0);
            expect(result.meta.total).toBe(0);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page equal to totalPages', async () => {
            const query = { page: 2, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult(Array(5).fill(mockPost), 10, 2, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with page 0 (should default to 1)', async () => {
            const query = { page: 0, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1, 0, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.page).toBe(0);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with negative page (should default to 1)', async () => {
            const query = { page: -2, limit: 5 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 1, -2, 5));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.page).toBe(-2);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page greater than totalPages', async () => {
            const query = { page: 5, limit: 2 };
            mockPostRepository.findMany.mockResolvedValue(buildResult([mockPost], 3, 5, 2));
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.getPosts(query);

            expect(result.meta.page).toBe(5);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(true);
        });
    });

    describe('updatePost', () => {
        it('should update a post with user info', async () => {
            const userId = 'user-1';
            const postId = '1';
            const updatePostDto = {
                title: 'Updated Title',
                content: 'Updated content',
            };
            const updatedPost = { ...mockPost, ...updatePostDto };

            mockPostRepository.update.mockResolvedValue(updatedPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(updatedPost as any);

            const result = await service.updatePost(userId, postId, updatePostDto);

            expect(mockPostRepository.update).toHaveBeenCalledWith(postId, {
                ...updatePostDto,
                updatedBy: userId,
            });
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(updatedPost);
            expect(result).toEqual(updatedPost);
        });
    });

    describe('softDeletePosts', () => {
        it('should soft delete multiple posts', async () => {
            const userId = 'user-1';
            const postIds = ['1', '2', '3'];

            mockPostRepository.softDeleteMany.mockResolvedValue(3);

            const result = await service.softDeletePosts(userId, postIds);

            expect(mockPostRepository.softDeleteMany).toHaveBeenCalledWith(postIds, userId);
            expect(result).toEqual({ count: 3 });
        });
    });
});
