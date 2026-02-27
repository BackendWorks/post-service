import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from 'src/common/common.module';
import { PostModule } from '../modules/post/post.module';
import { AppController } from './app.controller';
import { PostGrpcController } from './post.grpc.controller';
import { GrpcModule } from 'nestjs-grpc';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        CommonModule,
        PostModule,
        TerminusModule,
        GrpcModule.forProviderAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                protoPath: join(__dirname, '../protos/post.proto'),
                package: configService.get<string>('grpc.package', 'post'),
                url: configService.get<string>('grpc.url', '0.0.0.0:50052'),
                logging: {
                    enabled: true,
                    level: configService.get<string>('app.env') === 'development' ? 'debug' : 'log',
                    context: 'PostService',
                    logErrors: true,
                    logPerformance: configService.get<string>('app.env') === 'development',
                    logDetails: configService.get<string>('app.env') === 'development',
                },
            }),
        }),
    ],
    controllers: [AppController, PostGrpcController],
    providers: [],
})
export class AppModule {}
