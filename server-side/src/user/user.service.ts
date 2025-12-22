import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMethod } from '@prisma/client';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(public readonly prismaService: PrismaService) {}

  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      include: { accounts: true },
    });
  }

  public async create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ) {
    return this.prismaService.user.create({
      data: {
        email,
        password: password ? await hash(password) : '',
        displayName,
        picture,
        method,
        isVerified,
      },
      include: { accounts: true },
    });
  }

  public async update(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    return this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: dto.email,
        displayName: dto.name,
        isTwoFactorEnabled: dto.isTwoFactorEnabled,
      },
    });
  }
}
