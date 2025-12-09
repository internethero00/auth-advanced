import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export const Authorized = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user[data] : user;
  },
);
