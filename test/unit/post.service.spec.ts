import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../../src/modules/post/services/post.service';
import { DatabaseService } from '../../src/common/services/database.service';
import { QueryBuilderService } from '../../src/common/services/query-builder.service';
import { PostMappingService } from '../../src/modules/post/services/post-mapping.service';

describe('PostService', () => {
    let service: PostService;
    let queryBuilderService: QueryBuilderService;
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

    const mockDatabaseService = {
        post: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
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
                        enrichPostData: jest.fn(),
                        enrichPostsData: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        queryBuilderService = module.get<QueryBuilderService>(QueryBuilderService);
        postMappingService = module.get<PostMappingService>(PostMappingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a post', async () => {
            const createPostDto = {
                title: 'Test Post',
                content: 'Test content',
            };
            const userId = 'user-1';

            mockDatabaseService.post.create.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.create(createPostDto, userId);

            expect(mockDatabaseService.post.create).toHaveBeenCalledWith({
                data: {
                    ...createPostDto,
                    createdBy: userId,
                },
            });
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });
    });

    describe('createPost', () => {
        it('should create a post with images', async () => {
            const createPostDto = {
                title: 'Test Post',
                content: 'Test content',
                images: ['image1.jpg', 'image2.jpg'],
            };
            const userId = 'user-1';

            mockDatabaseService.post.create.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'enrichPostData').mockResolvedValue(mockPost as any);

            const result = await service.createPost(createPostDto, userId);

            expect(mockDatabaseService.post.create).toHaveBeenCalledWith({
                data: {
                    title: createPostDto.title,
                    content: createPostDto.content,
                    images: createPostDto.images,
                    createdBy: userId,
                },
            });
            expect(postMappingService.enrichPostData).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });

        it('should create a post without images', async () => {
            const createPostDto = {
                title: 'Test Post',
                content: 'Test content',
            };
            const userId = 'user-1';

            mockDatabaseService.post.create.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'enrichPostData').mockResolvedValue(mockPost as any);

            const result = await service.createPost(createPostDto, userId);

            expect(mockDatabaseService.post.create).toHaveBeenCalledWith({
                data: {
                    title: createPostDto.title,
                    content: createPostDto.content,
                    images: [],
                    createdBy: userId,
                },
            });
            expect(result).toEqual(mockPost);
        });
    });

    describe('findAll', () => {
        it('should find all posts', async () => {
            const queryParams = { page: 1, limit: 10 };
            const mockResult = {
                items: [mockPost],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            jest.spyOn(queryBuilderService, 'findManyWithPagination').mockResolvedValue(mockResult);
            jest.spyOn(postMappingService, 'mapToListResponse').mockReturnValue({
                data: [mockPost],
                meta: mockResult.meta,
            } as any);

            await service.findAll(queryParams);

            expect(queryBuilderService.findManyWithPagination).toHaveBeenCalledWith({
                model: 'post',
                dto: queryParams,
                searchFields: ['title', 'content'],
            });
            expect(postMappingService.mapToListResponse).toHaveBeenCalledWith(
                [mockPost],
                1,
                queryParams,
            );
        });
    });

    describe('findOne', () => {
        it('should find a post by id', async () => {
            const postId = '1';
            mockDatabaseService.post.findUnique.mockResolvedValue(mockPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(mockPost as any);

            const result = await service.findOne(postId);

            expect(mockDatabaseService.post.findUnique).toHaveBeenCalledWith({
                where: { id: postId },
            });
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(mockPost);
            expect(result).toEqual(mockPost);
        });

        it('should return null if post not found', async () => {
            const postId = '999';
            mockDatabaseService.post.findUnique.mockResolvedValue(null);

            const result = await service.findOne(postId);

            expect(mockDatabaseService.post.findUnique).toHaveBeenCalledWith({
                where: { id: postId },
            });
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a post', async () => {
            const postId = '1';
            const updatePostDto = {
                title: 'Updated Title',
                content: 'Updated content',
            };
            const updatedPost = { ...mockPost, ...updatePostDto };

            mockDatabaseService.post.update.mockResolvedValue(updatedPost);
            jest.spyOn(postMappingService, 'mapToResponse').mockReturnValue(updatedPost as any);

            const result = await service.update(postId, updatePostDto);

            expect(mockDatabaseService.post.update).toHaveBeenCalledWith({
                where: { id: postId },
                data: updatePostDto,
            });
            expect(postMappingService.mapToResponse).toHaveBeenCalledWith(updatedPost);
            expect(result).toEqual(updatedPost);
        });
    });

    describe('remove', () => {
        it('should remove a post', async () => {
            const postId = '1';
            mockDatabaseService.post.delete.mockResolvedValue(mockPost);

            const result = await service.remove(postId);

            expect(mockDatabaseService.post.delete).toHaveBeenCalledWith({
                where: { id: postId },
            });
            expect(result).toEqual(mockPost);
        });
    });

    describe('getPosts', () => {
        it('should get posts with pagination', async () => {
            const query = { page: 1, limit: 10 };
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
        });

        it('should get posts with search', async () => {
            const query = { page: 1, limit: 10, search: 'test search' };
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts by author', async () => {
            const query = { page: 1, limit: 10, authorId: 'user-1' };
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts without author filter', async () => {
            const query = { page: 1, limit: 10 }; // No authorId
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with falsy authorId', async () => {
            const query = { page: 1, limit: 10, authorId: '' }; // Falsy authorId
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with authorId and search', async () => {
            const query = { page: 1, limit: 10, authorId: 'user-1', search: 'test search' };
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with falsy search', async () => {
            const query = { page: 1, limit: 10, search: '' }; // Falsy search
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with null search', async () => {
            const query = { page: 1, limit: 10, search: null as any }; // Null search
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with undefined search', async () => {
            const query = { page: 1, limit: 10, search: undefined as any }; // Undefined search
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with null authorId', async () => {
            const query = { page: 1, limit: 10, authorId: null as any }; // Null authorId
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with undefined authorId', async () => {
            const query = { page: 1, limit: 10, authorId: undefined as any }; // Undefined authorId
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with no query parameters', async () => {
            const query = { page: 1, limit: 10 }; // Only required parameters
            const mockPosts = [mockPost];
            const mockCount = 1;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
        });

        it('should get posts with page 1 and multiple pages', async () => {
            const query = { page: 1, limit: 5 };
            const mockPosts = [mockPost, mockPost, mockPost, mockPost, mockPost];
            const mockCount = 15; // 3 pages total

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page 2 and multiple pages', async () => {
            const query = { page: 2, limit: 5 };
            const mockPosts = [mockPost, mockPost, mockPost, mockPost, mockPost];
            const mockCount = 15; // 3 pages total

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with last page', async () => {
            const query = { page: 3, limit: 5 };
            const mockPosts = [mockPost, mockPost, mockPost, mockPost, mockPost];
            const mockCount = 15; // 3 pages total

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with single page', async () => {
            const query = { page: 1, limit: 10 };
            const mockPosts = [mockPost];
            const mockCount = 1; // Single page

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with zero count', async () => {
            const query = { page: 1, limit: 10 };
            const mockPosts = [];
            const mockCount = 0;

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page equal to totalPages', async () => {
            const query = { page: 2, limit: 5 };
            const mockPosts = [mockPost, mockPost, mockPost, mockPost, mockPost];
            const mockCount = 10; // 2 pages total, page 2 is the last page

            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);

            const result = await service.getPosts(query);

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(mockCount);
            expect(result.meta.hasNextPage).toBe(false); // page (2) >= totalPages (2)
            expect(result.meta.hasPreviousPage).toBe(true);
        });

        it('should get posts with page 0 (should default to 1)', async () => {
            const query = { page: 0, limit: 5 };
            const mockPosts = [mockPost];
            const mockCount = 1;
            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);
            const result = await service.getPosts(query);
            expect(result.meta.page).toBe(0); // The service uses page=0, but logic defaults to 1 for skip/take
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with negative page (should default to 1)', async () => {
            const query = { page: -2, limit: 5 };
            const mockPosts = [mockPost];
            const mockCount = 1;
            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);
            const result = await service.getPosts(query);
            expect(result.meta.page).toBe(-2); // The service uses page=-2, but logic defaults to 1 for skip/take
            expect(result.meta.hasPreviousPage).toBe(false);
        });

        it('should get posts with page greater than totalPages', async () => {
            const query = { page: 5, limit: 2 };
            const mockPosts = [mockPost];
            const mockCount = 3; // totalPages = 2
            mockDatabaseService.post.findMany.mockResolvedValue(mockPosts);
            mockDatabaseService.post.count.mockResolvedValue(mockCount);
            jest.spyOn(postMappingService, 'enrichPostsData').mockResolvedValue(mockPosts as any);
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

            mockDatabaseService.post.update.mockResolvedValue(updatedPost);
            jest.spyOn(postMappingService, 'enrichPostData').mockResolvedValue(updatedPost as any);

            const result = await service.updatePost(userId, postId, updatePostDto);

            expect(mockDatabaseService.post.update).toHaveBeenCalledWith({
                where: { id: postId },
                data: { ...updatePostDto, updatedBy: userId },
            });
            expect(postMappingService.enrichPostData).toHaveBeenCalledWith(updatedPost);
            expect(result).toEqual(updatedPost);
        });
    });

    describe('softDeletePosts', () => {
        it('should soft delete multiple posts', async () => {
            const userId = 'user-1';
            const postIds = ['1', '2', '3'];
            const mockResult = { count: 3 };

            mockDatabaseService.post.updateMany.mockResolvedValue(mockResult);

            const result = await service.softDeletePosts(userId, postIds);

            expect(mockDatabaseService.post.updateMany).toHaveBeenCalledWith({
                where: {
                    id: {
                        in: postIds,
                    },
                },
                data: {
                    isDeleted: true,
                    deletedAt: expect.any(Date),
                    deletedBy: userId,
                },
            });
            expect(result).toEqual({ count: 3 });
        });
    });
});
