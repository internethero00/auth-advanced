import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { AuthMethod, User } from '@prisma/client';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/loginDto';
import { verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { ProviderService } from './provider/provider.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly prismaService: PrismaService,
  ) {}
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

  public async login(req: Request, dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) {
      throw new NotFoundException('Email does not exist');
    }
    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.saveSession(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('SESSION DESTROY ERROR >>>', err);
          return reject(
            new InternalServerErrorException('Could not destroy session'),
          );
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
        return resolve();
      });
    });
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ) {
    const providerInstance = this.providerService.findByService(provider);
    const profile = await providerInstance?.findUserByCode(code);
    const account = await this.prismaService.account.findFirst({
      where: {
        id: String(profile!.id),
        provider: profile!.provider,
      },
    });

    let user = account?.userId
      ? await this.userService.findById(account.userId)
      : null;
  }

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
