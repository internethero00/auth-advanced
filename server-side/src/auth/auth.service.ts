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
import { userCreateYandexChanger } from './provider/services/types/userCreateYandexChanger';
import { YandexProfile } from './provider/services/types/yandexProfile';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly prismaService: PrismaService,
    private readonly emailConfirmationService: EmailConfirmationService,
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

    await this.emailConfirmationService.sendVerificationToken(newUser.email);

    return {
      message:
        'User created successfully. Please check your email to verify your account',
    };
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

    if (!user.isVerified) {
      await this.emailConfirmationService.sendVerificationToken(user.email);
      throw new UnauthorizedException('Please verify your email');
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

    if (user) {
      return this.saveSession(req, user);
    }
    if (profile!.provider === 'google') {
      user = await this.userService.create(
        profile!.email,
        '',
        profile!.name!,
        profile!.picture!,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        AuthMethod[profile!.provider.toUpperCase()],
        true,
      );
    }
    if (profile!.provider === 'yandex') {
      const userData = userCreateYandexChanger(
        profile as unknown as YandexProfile,
      );
      user = await this.userService.create(
        userData.email,
        '',
        userData.displayName!,
        userData.picture!,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        userData.method,
        userData.isVerified,
      );
    }

    if (!account) {
      await this.prismaService.account.create({
        data: {
          userId: user!.id,
          type: 'oauth',
          provider: profile!.provider,
          accessToken: profile!.access_token,
          refreshToken: profile!.refresh_token,
          expiresAt: profile!.expires_at!,
        },
      });
    }

    return this.saveSession(req, user!);
  }

  public async saveSession(req: Request, user: User) {
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
