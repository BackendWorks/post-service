import { Test, TestingModule } from '@nestjs/testing';
import { QueryBuilderService } from '../../src/common/services/query-builder.service';
import { DatabaseService } from '../../src/common/services/database.service';

describe('QueryBuilderService', () => {
    let service: QueryBuilderService;
    let mockDatabaseService: any;
    let mockPostRepository: any;

    const makePaginatedResult = (items: any[], total: number, page = 1, limit = 10) => ({
        items,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
        },
    });

    beforeEach(async () => {
        mockPostRepository = {
            findMany: jest.fn(),
            count: jest.fn(),
        };
        mockDatabaseService = {
            postRepository: mockPostRepository,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueryBuilderService,
                { provide: DatabaseService, useValue: mockDatabaseService },
            ],
        }).compile();

        service = module.get<QueryBuilderService>(QueryBuilderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findManyWithPagination', () => {
        it('should find many with pagination', async () => {
            const mockPosts = [
                { id: '1', title: 'Test Post 1', content: 'Content 1' },
                { id: '2', title: 'Test Post 2', content: 'Content 2' },
            ];
            const paginatedResult = makePaginatedResult(mockPosts, 2);
            mockPostRepository.findMany.mockResolvedValue(paginatedResult);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1, limit: 10, searchFields: ['title', 'content'] }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
        });

        it('should handle search functionality', async () => {
            const mockPosts = [{ id: '1', title: 'Search Result', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ search: 'test', searchFields: ['title', 'content'] }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle search with multiple fields', async () => {
            const mockPosts = [{ id: '1', title: 'Search Result', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: ['title', 'content', 'author'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ searchFields: ['title', 'content', 'author'] }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle custom filters', async () => {
            const mockPosts = [{ id: '1', title: 'Filtered Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                customFilters: { authorId: 'user-1' },
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({ authorId: 'user-1' }),
                }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle relations', async () => {
            const mockPosts = [{ id: '1', title: 'Post with Relations', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: ['author', 'comments'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ relations: ['author', 'comments'] }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle nested relations', async () => {
            const mockPosts = [
                { id: '1', title: 'Post with Nested Relations', content: 'Content' },
            ];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: ['author.profile', 'comments.user'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle default sorting', async () => {
            const mockPosts = [{ id: '1', title: 'Sorted Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                defaultSort: { field: 'createdAt', order: 'desc' },
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ sortBy: 'createdAt', sortOrder: 'desc' }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle custom sorting from dto', async () => {
            const mockPosts = [{ id: '1', title: 'Custom Sorted Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, sortBy: 'title', sortOrder: 'asc' },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ sortBy: 'title', sortOrder: 'asc' }),
            );
            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should cap limit at 100', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(
                makePaginatedResult(mockPosts, 1, 1, 100),
            );

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 150 },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 100 }),
            );
            expect(result.meta.limit).toBe(100);
        });

        it('should use default limit when limit is 0', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1, 1, 10));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 0 },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 10 }),
            );
        });

        it('should use page 1 when page is 0', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult(mockPosts, 1, 1, 10));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 0, limit: 10 },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1 }),
            );
        });

        it('should handle search with empty searchFields', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: [],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ searchFields: undefined }),
            );
            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle domain filtering', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, emailDomain: 'example.com' },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({
                        email: { endsWith: '@example.com' },
                    }),
                }),
            );
        });

        it('should handle name filtering with contains', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, authorName: 'John' },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({
                        authorName: { contains: 'John', mode: 'insensitive' },
                    }),
                }),
            );
        });

        it('should handle date filtering', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, createdDate: '2023-01-01' },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({
                        createdDate: { gte: new Date('2023-01-01') },
                    }),
                }),
            );
        });

        it('should handle array filtering', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, tags: ['tag1', 'tag2'] },
                searchFields: ['title', 'content'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({
                        tags: { in: ['tag1', 'tag2'] },
                    }),
                }),
            );
        });

        it('should skip undefined and null values in dto', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, undefinedValue: undefined, nullValue: null },
                searchFields: ['title', 'content'],
            });

            const callArg = mockPostRepository.findMany.mock.calls[0][0];
            expect(callArg.customFilters).not.toHaveProperty('undefinedValue');
            expect(callArg.customFilters).not.toHaveProperty('nullValue');
        });

        it('should handle empty relations array', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: [],
            });

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle complex nested relations', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: ['author.profile.settings', 'comments.user.profile'],
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    relations: ['author.profile.settings', 'comments.user.profile'],
                }),
            );
        });

        it('should handle undefined relations', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
            });

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should merge customFilters with dto-derived filters', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, status: 'published' },
                customFilters: { createdBy: 'user-1' },
            });

            expect(mockPostRepository.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    customFilters: expect.objectContaining({
                        status: 'published',
                        createdBy: 'user-1',
                    }),
                }),
            );
        });

        it('should handle non-string scalar values in dto (else branch)', async () => {
            mockPostRepository.findMany.mockResolvedValue(makePaginatedResult([], 0));

            await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, isPublished: true, viewCount: 42 },
            });

            const callArg = mockPostRepository.findMany.mock.calls[0][0];
            expect(callArg.customFilters).toHaveProperty('isPublished', true);
            expect(callArg.customFilters).toHaveProperty('viewCount', 42);
        });
    });

    describe('getCount', () => {
        it('should get count without filters', async () => {
            mockPostRepository.count.mockResolvedValue(10);

            const result = await service.getCount('post');

            expect(mockPostRepository.count).toHaveBeenCalledWith(undefined);
            expect(result).toBe(10);
        });

        it('should get count with filters', async () => {
            mockPostRepository.count.mockResolvedValue(3);

            const result = await service.getCount('post', { authorId: 'user-1' });

            expect(mockPostRepository.count).toHaveBeenCalledWith({ authorId: 'user-1' });
            expect(result).toBe(3);
        });

        it('should get count with multiple filters', async () => {
            mockPostRepository.count.mockResolvedValue(2);

            const result = await service.getCount('post', {
                authorId: 'user-1',
                status: 'published',
            });

            expect(mockPostRepository.count).toHaveBeenCalledWith({
                authorId: 'user-1',
                status: 'published',
            });
            expect(result).toBe(2);
        });
    });
});
