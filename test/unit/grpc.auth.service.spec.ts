import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcAuthService } from '../../src/services/auth/grpc.auth.service';
import { ValidateTokenResponse } from '../../src/generated/auth';
import { of } from 'rxjs';

describe('GrpcAuthService', () => {
    let service: GrpcAuthService;
    let mockClientGrpc: jest.Mocked<ClientGrpc>;
    let mockAuthService: any;

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        mockAuthService = {
            validateToken: jest.fn(),
            getUserById: jest.fn(),
            getUserByEmail: jest.fn(),
        };

        mockClientGrpc = {
            getService: jest.fn().mockReturnValue(mockAuthService),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GrpcAuthService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: 'AUTH_PACKAGE',
                    useValue: mockClientGrpc,
                },
            ],
        }).compile();

        service = module.get<GrpcAuthService>(GrpcAuthService);

        // Initialize the service
        service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should initialize auth service', () => {
            service.onModuleInit();

            expect(mockClientGrpc.getService).toHaveBeenCalledWith('AuthService');
        });
    });

    describe('validateToken', () => {
        it('should validate token successfully', async () => {
            const mockResponse = { isValid: true, userId: 'user-1' };
            mockAuthService.validateToken.mockReturnValue(of(mockResponse));

            const result = await service.validateToken('valid-token');

            expect(mockAuthService.validateToken).toHaveBeenCalledWith({ token: 'valid-token' });
            expect(result).toEqual(mockResponse);
        });

        it('should handle validation errors', async () => {
            const error = new Error('Invalid token');
            mockAuthService.validateToken.mockReturnValue(of(error));

            const result = await service.validateToken('invalid-token');

            expect(mockAuthService.validateToken).toHaveBeenCalledWith({ token: 'invalid-token' });
            expect(result).toEqual(error);
        });

        it('should create correct request object', async () => {
            const token = 'test-token';
            const expectedResponse: ValidateTokenResponse = {
                success: true,
                payload: {
                    id: 'user-123',
                    role: 'USER',
                },
            };

            mockAuthService.validateToken.mockReturnValue(of(expectedResponse));

            const result = await service.validateToken(token);

            expect(mockAuthService.validateToken).toHaveBeenCalledWith({ token });
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('getUserById', () => {
        it('should get user by id successfully', async () => {
            const mockUser = { id: 'user-1', email: 'user@example.com' };
            mockAuthService.getUserById.mockReturnValue(of(mockUser));

            const result = await service.getUserById('user-1');

            expect(mockAuthService.getUserById).toHaveBeenCalledWith({ id: 'user-1' });
            expect(result).toEqual(mockUser);
        });

        it('should handle user not found', async () => {
            const error = new Error('User not found');
            mockAuthService.getUserById.mockReturnValue(of(error));

            const result = await service.getUserById('non-existent');

            expect(mockAuthService.getUserById).toHaveBeenCalledWith({ id: 'non-existent' });
            expect(result).toEqual(error);
        });
    });

    describe('getUserByEmail', () => {
        it('should get user by email successfully', async () => {
            const mockUser = { id: 'user-1', email: 'user@example.com' };
            mockAuthService.getUserByEmail.mockReturnValue(of(mockUser));

            const result = await service.getUserByEmail('user@example.com');

            expect(mockAuthService.getUserByEmail).toHaveBeenCalledWith({
                email: 'user@example.com',
            });
            expect(result).toEqual(mockUser);
        });

        it('should handle email not found', async () => {
            const error = new Error('Email not found');
            mockAuthService.getUserByEmail.mockReturnValue(of(error));

            const result = await service.getUserByEmail('nonexistent@example.com');

            expect(mockAuthService.getUserByEmail).toHaveBeenCalledWith({
                email: 'nonexistent@example.com',
            });
            expect(result).toEqual(error);
        });
    });

    describe('edge cases', () => {
        it('should handle empty token', async () => {
            const mockResponse = { isValid: false };
            mockAuthService.validateToken.mockReturnValue(of(mockResponse));

            const result = await service.validateToken('');

            expect(mockAuthService.validateToken).toHaveBeenCalledWith({ token: '' });
            expect(result).toEqual(mockResponse);
        });

        it('should handle empty user id', async () => {
            const mockUser = { id: '', email: '' };
            mockAuthService.getUserById.mockReturnValue(of(mockUser));

            const result = await service.getUserById('');

            expect(mockAuthService.getUserById).toHaveBeenCalledWith({ id: '' });
            expect(result).toEqual(mockUser);
        });

        it('should handle empty email', async () => {
            const mockUser = { id: '', email: '' };
            mockAuthService.getUserByEmail.mockReturnValue(of(mockUser));

            const result = await service.getUserByEmail('');

            expect(mockAuthService.getUserByEmail).toHaveBeenCalledWith({ email: '' });
            expect(result).toEqual(mockUser);
        });
    });
});
