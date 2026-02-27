import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { createPostDbManager, IPostDbManager, IPostRepository } from '@backendworks/post-db';

@Injectable()
export class DatabaseService {
    protected logger: Logger;
    private readonly dbManager: IPostDbManager;

    constructor() {
        this.logger = new Logger(DatabaseService.name);
        this.dbManager = createPostDbManager(process.env.DATABASE_URL as string);
    }

    get postRepository(): IPostRepository {
        return this.dbManager.postRepository;
    }

    async onModuleInit(): Promise<void> {
        try {
            this.logger.log('Database connection established');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy(): Promise<void> {
        try {
            await this.dbManager.disconnect();
            this.logger.log('Database connection closed');
        } catch (error) {
            this.logger.error('Error closing database connection', error);
        }
    }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            await this.dbManager.postRepository.count();
            return {
                database: {
                    status: 'up',
                    connection: 'active',
                },
            };
        } catch (error) {
            this.logger.error('Database health check failed', error);
            return {
                database: {
                    status: 'down',
                    connection: 'failed',
                    error: error.message,
                },
            };
        }
    }
}
