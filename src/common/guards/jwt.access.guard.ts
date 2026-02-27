import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GrpcAuthService } from '../../services/auth/grpc.auth.service';
import { PUBLIC_ROUTE_KEY } from '../constants/request.constant';

@Injectable()
export class AuthJwtAccessGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private grpcAuthService: GrpcAuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        try {
            const response = await this.grpcAuthService.validateToken(token);

            if (!response.success || !response.payload) {
                throw new UnauthorizedException('Invalid token');
            }

            request.user = {
                id: response.payload.id,
                role: response.payload.role,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Token validation failed');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
