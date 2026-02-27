import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ROLES_DECORATOR_KEY } from '../constants/request.constant';
import { ROLE } from '../enums/app.enum';

export const AllowedRoles = (roles: ROLE[]) => {
    return applyDecorators(SetMetadata(ROLES_DECORATOR_KEY, roles), ApiBearerAuth('accessToken'));
};

// Convenience decorators for common role combinations
export const AdminOnly = () => AllowedRoles([ROLE.ADMIN]);
export const UserAndAdmin = () => AllowedRoles([ROLE.USER, ROLE.ADMIN]);
