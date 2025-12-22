import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../libs/mail/mail.service';
import { TokenType } from '@prisma/client';

@Injectable()
export class TwoFactorAuthService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async validateTwoFactorToken(email: string, code: string) {
    const existingToken = await this.prismaService.token.findFirst({
      where: { email, type: TokenType.TWO_FACTOR },
    });
    if (!existingToken) {
      throw new NotFoundException('Invalid token not found');
    }

    if (existingToken.token !== code) {
      throw new BadRequestException('Invalid code');
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();

    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }
    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
        type: TokenType.TWO_FACTOR,
      },
    });
    return true;
  }

  public async sendTwoFactorToken(email: string) {
    const twoFactorToken = await this.generateTwoFactorToken(email);
    await this.mailService.sendTwoFactorTokenEmail(
      twoFactorToken.email,
      twoFactorToken.token,
    );
    return true;
  }

  private async generateTwoFactorToken(email: string) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = new Date(new Date().getTime() + 1000 * 300);

    const existingToken = await this.prismaService.token.findFirst({
      where: { email, type: TokenType.TWO_FACTOR },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
          type: TokenType.TWO_FACTOR,
        },
      });
    }

    return this.prismaService.token.create({
      data: {
        type: TokenType.TWO_FACTOR,
        email,
        expiresIn,
        token,
      },
    });
  }
}
