import * as dayjs from 'dayjs';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';

export class VerifyUserEmailService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(id: string, email: string): Promise<void> {
    const user = await this.repository.findById(id);
    const dateNow = dayjs();

    user.verifyEmail(dateNow, email);

    await this.repository.persist(user);
  }
}
