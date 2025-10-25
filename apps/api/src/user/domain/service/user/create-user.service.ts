import * as dayjs from 'dayjs';
import * as argon from 'argon2';
import { UserModel } from '../../model/user/user.model';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { UserRoles } from '~/common/domain/enum/user-roles';

export class CreateUserService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(id: string, email: string, password: string, roles?: UserRoles[]): Promise<void> {
    const hashedPassword = await argon.hash(password);
    const dateNow = dayjs();

    const userModel = UserModel.create(dateNow, id, email, hashedPassword, roles);

    await this.repository.persist(userModel);
  }
}
