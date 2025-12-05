import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  public async register(dto: RegisterDto) {}

  public async login() {}

  public async logout() {}

  private async saveSession() {}
}
