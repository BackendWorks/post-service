import { Module } from '@nestjs/common';
import { GrpcAuthService } from './grpc.auth.service';
import { GrpcModule } from 'nestjs-grpc';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule,
        GrpcModule.forConsumerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                package: configService.get<string>('grpc.authPackage', 'auth'),
                protoPath: join(__dirname, '../../protos/auth.proto'),
                url: configService.get<string>('grpc.authUrl', '0.0.0.0:50051'),
                serviceName: 'AuthService',
            }),
            inject: [ConfigService],
            providers: [GrpcAuthService],
        }),
    ],
    providers: [GrpcAuthService],
    exports: [GrpcAuthService],
})
export class GrpcAuthModule {}
