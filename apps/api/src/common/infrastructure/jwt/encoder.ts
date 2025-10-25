import * as dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class Encoder {
  constructor(
    private jwt: JwtService,
    @Inject('JWT_SECRET') private jwtSecret: string,
  ) {}

  async encode(ttlSeconds: number, payload: any): Promise<{ token: string; expiresAt: Date }> {
    const accessTokenExpiresAt = dayjs().add(ttlSeconds, 'seconds');
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: ttlSeconds * 1, secret: this.jwtSecret });

    return { token: accessToken, expiresAt: accessTokenExpiresAt.toDate() };
  }
}
