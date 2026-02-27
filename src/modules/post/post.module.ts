import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { PostMappingService } from './services/post-mapping.service';
import { CommonModule } from '../../common/common.module';

export const POST_WORKER_CLIENT = 'POST_WORKER_CLIENT';

@Module({
    imports: [
        CommonModule,
        ClientsModule.registerAsync([
            {
                name: POST_WORKER_CLIENT,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.getOrThrow<string>('rabbitmq.url')],
                        queue: configService.getOrThrow<string>('rabbitmq.postWorkerQueue'),
                        queueOptions: { durable: true },
                    },
                }),
            },
        ]),
    ],
    controllers: [PostController],
    providers: [PostService, PostMappingService],
    exports: [PostService, PostMappingService],
})
export class PostModule {}
