import { Controller, Delete, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class DeleteRefreshTokenCookiesAction {
  @Delete('refresh-token-cookies')
  @HttpCode(204)
  invoke(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('refresh-token', {
      path: '/v1/auth/tokens',
    });
  }
}
