import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from '../../src/common/services/hash.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('HashService', () => {
    let service: HashService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HashService],
        }).compile();

        service = module.get<HashService>(HashService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createHash', () => {
        it('should hash a password synchronously', () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.hashSync.mockReturnValue(hashedPassword);

            const result = service.createHash(password);

            expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it('should handle hash creation errors', () => {
            const password = 'testpassword';
            const error = new Error('Hash creation failed');

            mockedBcrypt.hashSync.mockImplementation(() => {
                throw error;
            });

            expect(() => service.createHash(password)).toThrow('Hash creation failed');
        });
    });

    describe('match', () => {
        it('should verify a password synchronously', () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compareSync.mockReturnValue(true);

            const result = service.match(hashedPassword, password);

            expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should reject invalid password synchronously', () => {
            const wrongPassword = 'wrongpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compareSync.mockReturnValue(false);

            const result = service.match(hashedPassword, wrongPassword);

            expect(mockedBcrypt.compareSync).toHaveBeenCalledWith(wrongPassword, hashedPassword);
            expect(result).toBe(false);
        });

        it('should handle comparison errors gracefully', () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compareSync.mockImplementation(() => {
                throw new Error('Comparison failed');
            });

            const result = service.match(hashedPassword, password);

            expect(result).toBe(false);
        });
    });

    describe('createHashAsync', () => {
        it('should hash a password asynchronously', async () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

            const result = await service.createHashAsync(password);

            expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it('should handle async hash creation errors', async () => {
            const password = 'testpassword';
            const error = new Error('Hash creation failed');

            mockedBcrypt.hash.mockRejectedValue(error as never);

            await expect(service.createHashAsync(password)).rejects.toThrow('Hash creation failed');
        });
    });

    describe('matchAsync', () => {
        it('should verify a password asynchronously', async () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.matchAsync(hashedPassword, password);

            expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should reject invalid password asynchronously', async () => {
            const wrongPassword = 'wrongpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compare.mockResolvedValue(false as never);

            const result = await service.matchAsync(hashedPassword, wrongPassword);

            expect(mockedBcrypt.compare).toHaveBeenCalledWith(wrongPassword, hashedPassword);
            expect(result).toBe(false);
        });

        it('should handle async comparison errors gracefully', async () => {
            const password = 'testpassword';
            const hashedPassword = 'hashedPassword';

            mockedBcrypt.compare.mockRejectedValue(new Error('Comparison failed') as never);

            const result = await service.matchAsync(hashedPassword, password);

            expect(result).toBe(false);
        });
    });
});
