import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthUserPayload } from '../interfaces/request.interface';

export const AuthUser = createParamDecorator(
    (data: keyof IAuthUserPayload | undefined, ctx: ExecutionContext): IAuthUserPayload | any => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as IAuthUserPayload;

        return data ? user?.[data] : user;
    },
);
