import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { AuthMethod, User } from '@prisma/client';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  public async register(req: Request, dto: RegisterDto) {
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
    return this.saveSession(req, newUser);
  }

  public async login() {}

  public async logout() {}

  private async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          console.error('SESSION SAVE ERROR >>>', err);
          return reject(
            new InternalServerErrorException('Could not save session'),
          );
        }
        return resolve({ user });
      });
    });
  }
}
