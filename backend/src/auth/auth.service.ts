import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateAuthDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email уже занят');
    }

    const hash = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      password: hash,
      name: dto.name,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: UpdateAuthDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: { id: string; email: string; name: string }) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}