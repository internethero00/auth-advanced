import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../libs/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '@prisma/client';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { hash } from 'argon2';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async resetPassword(dto: ResetPasswordDto) {
    const existingUser = await this.userService.findByEmail(dto.email);

    if (!existingUser) {
      throw new NotFoundException('User not found, please check your email');
    }
    const passwordResetToken = await this.generatePasswordResetToken(
      existingUser.email,
    );
    await this.mailService.sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    );
  }

  public async newPassword(token: string, dto: NewPasswordDto) {
    const existingToken = await this.prismaService.token.findFirst({
      where: { token, type: TokenType.PASSWORD_RESET },
    });
    if (!existingToken) {
      throw new NotFoundException('Invalid token not found');
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();
    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }

    const existingUser = await this.userService.findByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: { email: existingToken.email },
      data: { password: await hash(dto.password) },
    });
    await this.prismaService.token.delete({
      where: { id: existingToken.id, type: TokenType.PASSWORD_RESET },
    });
    return true;
  }

  private async generatePasswordResetToken(email: string) {
    const token = uuidv4();
    const expiresIn = new Date(new Date().getTime() + 1000 * 3600);

    const existingToken = await this.prismaService.token.findFirst({
      where: { email, type: TokenType.PASSWORD_RESET },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
          type: TokenType.PASSWORD_RESET,
        },
      });
    }

    return this.prismaService.token.create({
      data: {
        type: TokenType.PASSWORD_RESET,
        email,
        expiresIn,
        token,
      },
    });
  }
}
