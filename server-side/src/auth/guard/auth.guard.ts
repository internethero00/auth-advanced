import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly userService: UserService) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    if (typeof request.session.userId === 'undefined')
      throw new UnauthorizedException('Unauthorized');

    const user = await this.userService.findById(request.session.userId);

    request.user = user;

    return true;
  }
}
