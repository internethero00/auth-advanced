import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}
