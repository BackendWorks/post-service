import { registerAs } from '@nestjs/config';
import { IGrpcConfig } from '../interfaces/config.interface';

export default registerAs('grpc', (): IGrpcConfig => {
    const grpcUrl = process.env.GRPC_URL;
    const grpcPackage = process.env.GRPC_PACKAGE;

    const authGrpcUrl = process.env.GRPC_AUTH_URL;
    const authGrpcPackage = process.env.GRPC_AUTH_PACKAGE;

    return {
        url: grpcUrl,
        package: grpcPackage,
        authUrl: authGrpcUrl,
        authPackage: authGrpcPackage,
    };
});
