import { join } from 'path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import configs from './config';
import { AuthJwtAccessGuard } from './guards/jwt.access.guard';
import { RolesGuard } from './guards/roles.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HashService } from './services/hash.service';
import { DatabaseService } from './services/database.service';
import { ResponseExceptionFilter } from './filters/exception.filter';
import { RequestMiddleware } from './middlewares/request.middleware';
import { QueryBuilderService } from './services/query-builder.service';
import Joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { GrpcAuthModule } from '@/services/auth/grpc.auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: configs,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env.docker', '.env'],
            expandVariables: true,
            validationSchema: Joi.object({
                // App Configuration
                NODE_ENV: Joi.string()
                    .valid('development', 'staging', 'production', 'local')
                    .default('development'),
                APP_NAME: Joi.string().default('NestJS Post Service'),
                APP_DEBUG: Joi.boolean().truthy('true').falsy('false').default(false),

                // CORS Configuration
                APP_CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

                // HTTP Configuration
                HTTP_ENABLE: Joi.boolean().truthy('true').falsy('false').default(true),
                HTTP_HOST: Joi.string().default('0.0.0.0'),
                HTTP_PORT: Joi.number().port().default(9002),
                HTTP_VERSIONING_ENABLE: Joi.boolean().truthy('true').falsy('false').default(false),
                HTTP_VERSION: Joi.number().valid(1, 2).default(1),

                // Monitoring
                SENTRY_DSN: Joi.string().allow('').optional(),

                // Database Configuration
                DATABASE_URL: Joi.string().uri().required(),

                // Redis Configuration
                REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
                REDIS_KEY_PREFIX: Joi.string().default('post:'),
                REDIS_TTL: Joi.number().default(3600),

                // GRPC Configuration
                GRPC_URL: Joi.string().required(),
                GRPC_PACKAGE: Joi.string().default('post'),

                // Auth Service GRPC Configuration
                GRPC_AUTH_URL: Joi.string().required(),
                GRPC_AUTH_PACKAGE: Joi.string().default('auth'),
            }),
        }),
        CacheModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const ttl = configService.get<number>('redis.ttl') * 1000;
                const redisUrl = configService.get<string>('redis.url');
                return {
                    stores: [
                        new Keyv({
                            store: new CacheableMemory({
                                ttl,
                                lruSize: 5000,
                            }),
                        }),
                        createKeyv(redisUrl),
                    ],
                };
            },
            isGlobal: true,
        }),
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: join(__dirname, '../languages/'),
                watch: process.env.NODE_ENV === 'development',
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
        }),
        GrpcAuthModule,
    ],
    providers: [
        // Core Services
        DatabaseService,
        HashService,
        QueryBuilderService,

        // Global Interceptors
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },

        // Global Exception Filters
        {
            provide: APP_FILTER,
            useClass: ResponseExceptionFilter,
        },

        // Global Guards (order matters)
        {
            provide: APP_GUARD,
            useClass: AuthJwtAccessGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [DatabaseService, HashService, QueryBuilderService],
})
export class CommonModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestMiddleware).forRoutes('*');
    }
}
