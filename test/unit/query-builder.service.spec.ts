import { Test, TestingModule } from '@nestjs/testing';
import { QueryBuilderService } from '../../src/common/services/query-builder.service';
import { DatabaseService } from '../../src/common/services/database.service';

describe('QueryBuilderService', () => {
    let service: QueryBuilderService;
    let mockDatabaseService: jest.Mocked<DatabaseService>;

    beforeEach(async () => {
        const mockDatabaseServiceProvider = {
            provide: DatabaseService,
            useValue: {
                post: {
                    findMany: jest.fn(),
                    count: jest.fn(),
                },
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [QueryBuilderService, mockDatabaseServiceProvider],
        }).compile();

        service = module.get<QueryBuilderService>(QueryBuilderService);
        mockDatabaseService = module.get(DatabaseService);
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

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(2);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
        });

        it('should handle search functionality', async () => {
            const mockPosts = [{ id: '1', title: 'Search Result', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle search with multiple fields', async () => {
            const mockPosts = [{ id: '1', title: 'Search Result', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: ['title', 'content', 'author'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle custom filters', async () => {
            const mockPosts = [{ id: '1', title: 'Filtered Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, authorId: 'user-1' },
                searchFields: ['title', 'content'],
                customFilters: { authorId: 'user-1' },
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle relations', async () => {
            const mockPosts = [{ id: '1', title: 'Post with Relations', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: ['author', 'comments'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle nested relations', async () => {
            const mockPosts = [
                { id: '1', title: 'Post with Nested Relations', content: 'Content' },
            ];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

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

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                defaultSort: { field: 'createdAt', order: 'desc' },
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle custom sorting', async () => {
            const mockPosts = [{ id: '1', title: 'Custom Sorted Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, sortBy: 'title', sortOrder: 'asc' },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle pagination limits', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 150 }, // Should be capped at 100
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.limit).toBe(100); // Should be capped
        });

        it('should handle minimum pagination limits', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 0 }, // Should be set to 1
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.limit).toBe(10); // Should use the provided limit
        });

        it('should handle minimum page number', async () => {
            const mockPosts = [{ id: '1', title: 'Limited Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 0, limit: 10 }, // Should be set to 1
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.page).toBe(1); // Should be set to minimum
        });

        it('should handle search without search fields', async () => {
            const mockPosts = [{ id: '1', title: 'Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: [], // Empty search fields
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle domain filtering', async () => {
            const mockPosts = [{ id: '1', title: 'Domain Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, emailDomain: 'example.com' },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle date filtering', async () => {
            const mockPosts = [{ id: '1', title: 'Date Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, createdAt: '2023-01-01' },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle array filtering', async () => {
            const mockPosts = [{ id: '1', title: 'Array Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, tags: ['tag1', 'tag2'] },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle name filtering', async () => {
            const mockPosts = [{ id: '1', title: 'Name Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, authorName: 'John' },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle undefined and null values', async () => {
            const mockPosts = [{ id: '1', title: 'Null Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10, undefinedValue: undefined, nullValue: null },
                searchFields: ['title', 'content'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle empty relations', async () => {
            const mockPosts = [{ id: '1', title: 'Empty Relations Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: [], // Empty relations
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle complex nested relations', async () => {
            const mockPosts = [{ id: '1', title: 'Complex Relations Post', content: 'Content' }];

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(1);

            const result = await service.findManyWithPagination({
                model: 'post',
                dto: { page: 1, limit: 10 },
                searchFields: ['title', 'content'],
                relations: ['author.profile.settings', 'comments.user.profile'],
            });

            expect(result.items).toEqual(mockPosts);
            expect(result.meta.total).toBe(1);
        });

        it('should handle search with empty searchFields', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, search: 'test' },
                searchFields: [],
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle custom filters', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                customFilters: { createdBy: 'user-1' },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle domain fields', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, emailDomain: 'example.com' },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle date fields', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, createdAt: '2023-01-01' },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle array fields', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, tags: ['tag1', 'tag2'] },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle name fields with contains', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, userName: 'john' },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle nested relations', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                relations: ['user.profile', 'comments.author'],
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle empty relations array', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                relations: [],
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle undefined values in dto', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10, title: undefined, content: null },
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle empty include object', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                relations: [],
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle relations with include object', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                relations: ['user', 'comments'],
            };

            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);

            const result = await service.findManyWithPagination(options);

            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });

        it('should handle undefined relations (include undefined)', async () => {
            const options = {
                model: 'post',
                dto: { page: 1, limit: 10 },
                // relations is undefined
            };
            (mockDatabaseService.post.findMany as jest.Mock).mockResolvedValue([]);
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(0);
            const result = await service.findManyWithPagination(options);
            expect(result.items).toEqual([]);
            expect(result.meta.total).toBe(0);
        });
    });

    describe('getCount', () => {
        it('should get count', async () => {
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(5);

            const result = await service.getCount('post');

            expect(result).toBe(5);
            expect(mockDatabaseService.post.count).toHaveBeenCalledWith({
                where: { isDeleted: false },
            });
        });

        it('should get count with filters', async () => {
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(3);

            const result = await service.getCount('post', { authorId: 'user-1' });

            expect(result).toBe(3);
            expect(mockDatabaseService.post.count).toHaveBeenCalledWith({
                where: { isDeleted: false, authorId: 'user-1' },
            });
        });

        it('should get count with multiple filters', async () => {
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(2);

            const result = await service.getCount('post', {
                authorId: 'user-1',
                status: 'published',
            });

            expect(result).toBe(2);
            expect(mockDatabaseService.post.count).toHaveBeenCalledWith({
                where: {
                    isDeleted: false,
                    authorId: 'user-1',
                    status: 'published',
                },
            });
        });

        it('should handle getCount with filters', async () => {
            const filters = { createdBy: 'user-1' };
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(5);

            const result = await service.getCount('post', filters);

            expect(result).toBe(5);
        });

        it('should handle getCount without filters', async () => {
            (mockDatabaseService.post.count as jest.Mock).mockResolvedValue(10);

            const result = await service.getCount('post');

            expect(result).toBe(10);
        });
    });
});
