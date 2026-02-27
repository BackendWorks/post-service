import { DatabaseService } from '../../src/common/services/database.service';

describe('DatabaseService', () => {
    let service: DatabaseService;
    let mockLogger: any;
    let mockPrisma: any;

    beforeEach(() => {
        mockLogger = { log: jest.fn(), error: jest.fn() };
        mockPrisma = { $connect: jest.fn(), $disconnect: jest.fn() };
        service = new DatabaseService(mockPrisma as any, mockLogger);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call onModuleInit and log success', async () => {
        mockPrisma.$connect.mockResolvedValue(undefined);
        await service.onModuleInit();
        expect(mockPrisma.$connect).toHaveBeenCalled();
        expect(mockLogger.log).toHaveBeenCalledWith('Database connection established');
    });

    it('should call onModuleInit and log error', async () => {
        const error = new Error('fail');
        mockPrisma.$connect.mockRejectedValue(error);
        try {
            await service.onModuleInit();
        } catch (e) {}
        expect(mockLogger.error).toHaveBeenCalledWith('Failed to connect to database', error);
    });

    it('should call onModuleDestroy and log success', async () => {
        mockPrisma.$disconnect.mockResolvedValue(undefined);
        await service.onModuleDestroy();
        expect(mockPrisma.$disconnect).toHaveBeenCalled();
        expect(mockLogger.log).toHaveBeenCalledWith('Database connection closed');
    });

    it('should call onModuleDestroy and log error', async () => {
        const error = new Error('fail');
        mockPrisma.$disconnect.mockRejectedValue(error);
        await service.onModuleDestroy();
        expect(mockLogger.error).toHaveBeenCalledWith('Error closing database connection', error);
    });
});
