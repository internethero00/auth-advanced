import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '@prisma/client';

@Injectable()
export class EmailConfirmationService {
  constructor(private readonly prismaService: PrismaService) {}

  private async generateVerificationToken(email: string) {
    const token = uuidv4();
    const expiresIn = new Date(new Date().getTime() + 1000 * 3600);

    const existingToken = await this.prismaService.token.findFirst({
      where: { email, type: TokenType.VERIFICATION },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
          type: TokenType.VERIFICATION,
        },
      });
    }

    return this.prismaService.token.create({
      data: {
        type: TokenType.VERIFICATION,
        email,
        expiresIn,
        token,
      },
    });
  }
}
