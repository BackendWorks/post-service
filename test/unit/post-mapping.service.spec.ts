import { Test, TestingModule } from '@nestjs/testing';
import { PostMappingService } from '../../src/modules/post/services/post-mapping.service';
import { ROLE } from '../../src/common/enums/app.enum';

describe('PostMappingService', () => {
    let service: PostMappingService;

    const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        createdBy: 'user-1',
        updatedBy: null,
        deletedBy: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: null,
        images: [],
        isDeleted: false,
    };

    const mockPostWithUpdates = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        createdBy: 'user-1',
        updatedBy: 'user-2',
        deletedBy: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        deletedAt: null,
        images: ['image1.jpg'],
        isDeleted: false,
    };

    const mockPostWithDeletion = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        createdBy: 'user-1',
        updatedBy: null,
        deletedBy: 'user-3',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: new Date('2023-01-03'),
        images: [],
        isDeleted: true,
    };

    const mockPostWithNullImages = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        createdBy: 'user-1',
        updatedBy: null,
        deletedBy: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: null,
        images: null,
        isDeleted: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PostMappingService],
        }).compile();

        service = module.get<PostMappingService>(PostMappingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('mapToResponse', () => {
        it('should map post to response format', () => {
            const result = service.mapToResponse(mockPost);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPost.createdAt,
                    updatedAt: mockPost.updatedAt,
                },
                images: [],
                createdAt: mockPost.createdAt,
                updatedAt: mockPost.updatedAt,
                isDeleted: false,
            });
        });

        it('should map post with updates', () => {
            const result = service.mapToResponse(mockPostWithUpdates);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPostWithUpdates.createdAt,
                    updatedAt: mockPostWithUpdates.updatedAt,
                },
                updatedBy: {
                    id: 'user-2',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPostWithUpdates.createdAt,
                    updatedAt: mockPostWithUpdates.updatedAt,
                },
                images: ['image1.jpg'],
                createdAt: mockPostWithUpdates.createdAt,
                updatedAt: mockPostWithUpdates.updatedAt,
                isDeleted: false,
            });
        });

        it('should map post with deletion', () => {
            const result = service.mapToResponse(mockPostWithDeletion);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPostWithDeletion.createdAt,
                    updatedAt: mockPostWithDeletion.updatedAt,
                },
                deletedBy: {
                    id: 'user-3',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPostWithDeletion.createdAt,
                    updatedAt: mockPostWithDeletion.updatedAt,
                },
                images: [],
                createdAt: mockPostWithDeletion.createdAt,
                updatedAt: mockPostWithDeletion.updatedAt,
                deletedAt: mockPostWithDeletion.deletedAt,
                isDeleted: true,
            });
        });

        it('should map post with null values', () => {
            const result = service.mapToResponse(mockPostWithNullImages);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPostWithNullImages.createdAt,
                    updatedAt: mockPostWithNullImages.updatedAt,
                },
                images: [],
                createdAt: mockPostWithNullImages.createdAt,
                updatedAt: mockPostWithNullImages.updatedAt,
                isDeleted: false,
            });
        });

        it('should map post without optional fields', () => {
            const postWithoutOptionals = {
                ...mockPost,
                updatedBy: null,
                deletedBy: null,
                deletedAt: null,
            };

            const result = service.mapToResponse(postWithoutOptionals);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPost.createdAt,
                    updatedAt: mockPost.updatedAt,
                },
                images: [],
                createdAt: mockPost.createdAt,
                updatedAt: mockPost.updatedAt,
                isDeleted: false,
            });

            // Should not have optional fields
            expect(result).not.toHaveProperty('updatedBy');
            expect(result).not.toHaveProperty('deletedBy');
            expect(result).not.toHaveProperty('deletedAt');
        });

        it('should map post with all optional fields', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: 'user-2',
                deletedBy: 'user-3',
                deletedAt: new Date(),
                images: ['image1.jpg', 'image2.jpg'],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.title).toBe('Test Post');
            expect(result.content).toBe('Test Content');
            expect(result.createdBy.id).toBe('user-1');
            expect(result.updatedBy?.id).toBe('user-2');
            expect(result.deletedBy?.id).toBe('user-3');
            expect(result.deletedAt).toEqual(post.deletedAt);
            expect(result.images).toEqual(['image1.jpg', 'image2.jpg']);
            expect(result.isDeleted).toBe(true);
        });

        it('should map post with updatedBy but no deletedBy', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: 'user-2',
                deletedBy: null,
                deletedAt: null,
                images: ['image1.jpg'],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.updatedBy?.id).toBe('user-2');
            expect(result.deletedBy).toBeUndefined();
            expect(result.deletedAt).toBeUndefined();
            expect(result.isDeleted).toBe(false);
        });

        it('should map post with deletedBy but no updatedBy', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: null,
                deletedBy: 'user-3',
                deletedAt: new Date(),
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.updatedBy).toBeUndefined();
            expect(result.deletedBy?.id).toBe('user-3');
            expect(result.deletedAt).toEqual(post.deletedAt);
            expect(result.isDeleted).toBe(true);
        });

        it('should map post with deletedAt but no deletedBy', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: null,
                deletedBy: null,
                deletedAt: new Date(),
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.deletedBy).toBeUndefined();
            expect(result.deletedAt).toEqual(post.deletedAt);
        });

        it('should map post with deletedBy but no deletedAt', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: null,
                deletedBy: 'user-3',
                deletedAt: null,
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.deletedBy?.id).toBe('user-3');
            expect(result.deletedAt).toBeUndefined();
        });

        it('should map post with falsy updatedBy', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: '',
                deletedBy: null,
                deletedAt: null,
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.updatedBy).toBeUndefined();
        });

        it('should map post with falsy deletedBy', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: null,
                deletedBy: '',
                deletedAt: new Date(),
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.deletedBy).toBeUndefined();
        });

        it('should map post with falsy deletedAt', () => {
            const post = {
                id: 'post-1',
                title: 'Test Post',
                content: 'Test Content',
                createdBy: 'user-1',
                updatedBy: null,
                deletedBy: null,
                deletedAt: '',
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: true,
            } as any;

            const result = service.mapToResponse(post);

            expect(result.id).toBe('post-1');
            expect(result.deletedAt).toBeUndefined();
        });
    });

    describe('mapToListResponse', () => {
        it('should map posts list to paginated response', () => {
            const posts = [mockPost];
            const total = 1;
            const params = { page: 1, limit: 10 };

            const result = service.mapToListResponse(posts, total, params);

            expect(result).toEqual({
                statusCode: 200,
                timestamp: expect.any(String),
                message: 'Posts retrieved successfully',
                data: [
                    {
                        id: '1',
                        title: 'Test Post',
                        content: 'Test content',
                        createdBy: {
                            id: 'user-1',
                            email: '',
                            firstName: '',
                            lastName: '',
                            isVerified: false,
                            role: ROLE.USER,
                            createdAt: mockPost.createdAt,
                            updatedAt: mockPost.updatedAt,
                        },
                        images: [],
                        createdAt: mockPost.createdAt,
                        updatedAt: mockPost.updatedAt,
                        isDeleted: false,
                    },
                ],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            });
        });

        it('should handle multiple pages', () => {
            const posts = Array.from({ length: 10 }, (_, i) => ({
                ...mockPost,
                id: `${i + 1}`,
            }));
            const total = 25;
            const params = { page: 2, limit: 10 };

            const result = service.mapToListResponse(posts, total, params);

            expect(result.meta).toEqual({
                total: 25,
                page: 2,
                limit: 10,
                totalPages: 3,
                hasNextPage: true,
                hasPreviousPage: true,
            });
        });

        it('should handle empty posts list', () => {
            const posts: any[] = [];
            const total = 0;
            const params = { page: 1, limit: 10 };

            const result = service.mapToListResponse(posts, total, params);

            expect(result.data).toEqual([]);
            expect(result.meta.total).toBe(0);
            expect(result.meta.totalPages).toBe(0);
        });

        it('should handle default pagination values', () => {
            const posts = [mockPost];
            const total = 1;
            const params = {}; // No pagination params

            const result = service.mapToListResponse(posts, total, params);

            expect(result.meta).toEqual({
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            });
        });
    });

    describe('enrichPostData', () => {
        it('should enrich post data', async () => {
            const result = await service.enrichPostData(mockPost);

            expect(result).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPost.createdAt,
                    updatedAt: mockPost.updatedAt,
                },
                images: [],
                createdAt: mockPost.createdAt,
                updatedAt: mockPost.updatedAt,
                isDeleted: false,
            });
        });
    });

    describe('enrichPostsData', () => {
        it('should enrich posts data', async () => {
            const posts = [mockPost, mockPostWithUpdates];
            const result = await service.enrichPostsData(posts);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: '1',
                title: 'Test Post',
                content: 'Test content',
                createdBy: {
                    id: 'user-1',
                    email: '',
                    firstName: '',
                    lastName: '',
                    isVerified: false,
                    role: ROLE.USER,
                    createdAt: mockPost.createdAt,
                    updatedAt: mockPost.updatedAt,
                },
                images: [],
                createdAt: mockPost.createdAt,
                updatedAt: mockPost.updatedAt,
                isDeleted: false,
            });
        });

        it('should handle empty posts array', async () => {
            const posts: any[] = [];
            const result = await service.enrichPostsData(posts);

            expect(result).toEqual([]);
        });
    });
});
