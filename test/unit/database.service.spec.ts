import { DatabaseService } from '../../src/common/services/database.service';
import { createPostDbManager } from '@backendworks/post-db';

jest.mock('@backendworks/post-db', () => ({
    createPostDbManager: jest.fn(),
}));

describe('DatabaseService', () => {
    let service: DatabaseService;
    let mockPostRepository: any;
    let mockDbManager: any;

    beforeEach(() => {
        mockPostRepository = {
            findById: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            softDeleteMany: jest.fn(),
            count: jest.fn(),
        };
        mockDbManager = {
            postRepository: mockPostRepository,
            disconnect: jest.fn().mockResolvedValue(undefined),
        };
        (createPostDbManager as jest.Mock).mockReturnValue(mockDbManager);

        service = new DatabaseService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should expose postRepository from dbManager', () => {
        expect(service.postRepository).toBe(mockPostRepository);
    });

    it('should call onModuleInit and log success', async () => {
        const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();
        await service.onModuleInit();
        expect(logSpy).toHaveBeenCalledWith('Database connection established');
    });

    it('should log error and rethrow when onModuleInit fails', async () => {
        const mockError = new Error('Logger failed');
        jest.spyOn(service['logger'], 'log').mockImplementation(() => {
            throw mockError;
        });
        const errorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
        await expect(service.onModuleInit()).rejects.toThrow('Logger failed');
        expect(errorSpy).toHaveBeenCalledWith('Failed to connect to database', mockError);
    });

    it('should call onModuleDestroy and disconnect', async () => {
        const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation();
        await service.onModuleDestroy();
        expect(mockDbManager.disconnect).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith('Database connection closed');
    });

    it('should log error when onModuleDestroy fails', async () => {
        const error = new Error('fail');
        const errorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
        mockDbManager.disconnect.mockRejectedValue(error);
        await service.onModuleDestroy();
        expect(errorSpy).toHaveBeenCalledWith('Error closing database connection', error);
    });

    it('should return healthy status when count succeeds', async () => {
        mockPostRepository.count.mockResolvedValue(5);
        const result = await service.isHealthy();
        expect(result).toEqual({ database: { status: 'up', connection: 'active' } });
    });

    it('should return unhealthy status when count throws', async () => {
        const mockError = new Error('DB error');
        jest.spyOn(service['logger'], 'error').mockImplementation();
        mockPostRepository.count.mockRejectedValue(mockError);
        const result = await service.isHealthy();
        expect(result).toEqual({
            database: { status: 'down', connection: 'failed', error: mockError.message },
        });
    });
});
