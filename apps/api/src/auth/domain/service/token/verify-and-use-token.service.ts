import * as dayjs from 'dayjs';
import { TokenRepositoryInterface } from '~/auth/domain/model/token/token-repository.interface';
import { UnauthorizedException } from '@nestjs/common';
import { Id } from "~/common/domain/model/value-object/id";

export class VerifyAndUseTokenService {
  constructor(private repository: TokenRepositoryInterface) {}

  async invoke(id: Id, userId: Id): Promise<void> {
    const now = dayjs();
    const model = await this.repository.findById(id);

    if (!model.isValid(userId, now)) {
      throw new UnauthorizedException('Invalid token');
    }
    model.use(now);

    await this.repository.persist(model);
  }
}
