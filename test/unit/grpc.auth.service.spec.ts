import { Test, TestingModule } from '@nestjs/testing';
import { GrpcAuthService } from '../../src/services/auth/grpc.auth.service';
import { ValidateTokenResponse } from '../../src/generated/auth';
import { GrpcClientService } from 'nestjs-grpc';

describe('GrpcAuthService', () => {
    let service: GrpcAuthService;
    let mockGrpcClientService: jest.Mocked<GrpcClientService>;

    beforeEach(async () => {
        mockGrpcClientService = {
            call: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GrpcAuthService,
                {
                    provide: GrpcClientService,
                    useValue: mockGrpcClientService,
                },
            ],
        }).compile();

        service = module.get<GrpcAuthService>(GrpcAuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateToken', () => {
        it('should validate token successfully', async () => {
            const mockResponse: ValidateTokenResponse = {
                success: true,
                payload: { id: 'user-1', role: 'USER' },
            };
            mockGrpcClientService.call.mockResolvedValue(mockResponse);

            const result = await service.validateToken('valid-token');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'ValidateToken',
                { token: 'valid-token' },
            );
            expect(result).toEqual(mockResponse);
        });

        it('should create correct request object', async () => {
            const token = 'test-token';
            const expectedResponse: ValidateTokenResponse = {
                success: true,
                payload: { id: 'user-123', role: 'USER' },
            };
            mockGrpcClientService.call.mockResolvedValue(expectedResponse);

            const result = await service.validateToken(token);

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'ValidateToken',
                { token },
            );
            expect(result).toEqual(expectedResponse);
        });

        it('should throw error when validation fails', async () => {
            const error = new Error('Invalid token');
            mockGrpcClientService.call.mockRejectedValue(error);

            await expect(service.validateToken('invalid-token')).rejects.toThrow('Invalid token');
        });

        it('should handle empty token', async () => {
            const mockResponse = { success: false, payload: null };
            mockGrpcClientService.call.mockResolvedValue(mockResponse);

            const result = await service.validateToken('');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'ValidateToken',
                { token: '' },
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getUserById', () => {
        it('should get user by id successfully', async () => {
            const mockUser = { id: 'user-1', email: 'user@example.com' };
            mockGrpcClientService.call.mockResolvedValue(mockUser);

            const result = await service.getUserById('user-1');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'GetUserById',
                { id: 'user-1' },
            );
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            const error = new Error('User not found');
            mockGrpcClientService.call.mockRejectedValue(error);

            await expect(service.getUserById('non-existent')).rejects.toThrow('User not found');
        });

        it('should handle empty user id', async () => {
            const mockUser = { id: '', email: '' };
            mockGrpcClientService.call.mockResolvedValue(mockUser);

            const result = await service.getUserById('');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'GetUserById',
                { id: '' },
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('getUserByEmail', () => {
        it('should get user by email successfully', async () => {
            const mockUser = { id: 'user-1', email: 'user@example.com' };
            mockGrpcClientService.call.mockResolvedValue(mockUser);

            const result = await service.getUserByEmail('user@example.com');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'GetUserByEmail',
                { email: 'user@example.com' },
            );
            expect(result).toEqual(mockUser);
        });

        it('should throw error when email not found', async () => {
            const error = new Error('Email not found');
            mockGrpcClientService.call.mockRejectedValue(error);

            await expect(service.getUserByEmail('nonexistent@example.com')).rejects.toThrow(
                'Email not found',
            );
        });

        it('should handle empty email', async () => {
            const mockUser = { id: '', email: '' };
            mockGrpcClientService.call.mockResolvedValue(mockUser);

            const result = await service.getUserByEmail('');

            expect(mockGrpcClientService.call).toHaveBeenCalledWith(
                'AuthService',
                'GetUserByEmail',
                { email: '' },
            );
            expect(result).toEqual(mockUser);
        });
    });
});
