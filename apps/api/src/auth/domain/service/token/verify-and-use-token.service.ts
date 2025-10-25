import * as dayjs from 'dayjs';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { UnauthorizedException } from '@nestjs/common';

export class VerifyAndUseTokenService {
  constructor(private repository: TokenRepositoryInterface) {}

  async invoke(id: string, userId: string): Promise<void> {
    const now = dayjs();
    const model = await this.repository.findById(id);

    if (!model.isValid(userId, now)) {
      throw new UnauthorizedException('Invalid token');
    }
    model.use(now);

    await this.repository.persist(model);
  }
}
