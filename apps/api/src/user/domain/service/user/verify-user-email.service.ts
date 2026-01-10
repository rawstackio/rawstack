import * as dayjs from 'dayjs';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { Email } from '~/common/domain/model/value-object/email';
import { Id } from '~/common/domain/model/value-object/id';

export class VerifyUserEmailService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(id: Id, email: Email): Promise<void> {
    const user = await this.repository.findById(id);
    const dateNow = dayjs();

    user.verifyEmail(dateNow, email);

    await this.repository.persist(user);
  }
}
