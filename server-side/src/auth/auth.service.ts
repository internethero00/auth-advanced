import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { AuthMethod, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  public async register(dto: RegisterDto) {
    const { email, password, name } = dto;
    const user = await this.userService.findByEmail(email);
    if (user) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.userService.create(
      email,
      password,
      name,
      '',
      AuthMethod.CREDENTIALS,
      false,
    );
    return this.saveSession(newUser);
  }

  public async login() {}

  public async logout() {}

  private saveSession(user: User) {
    console.log('session id: ', user.id);
  }
}
