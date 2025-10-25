import { UserModel } from './user.model';

export interface UserRepositoryInterface {
  persist(User: UserModel): Promise<UserModel>;

  listIds(page: number, perPage: number, q?: string): Promise<string[]>;

  count(q?: string): Promise<number>;

  findById(id: string): Promise<UserModel>;

  findByIds(ids: string[]): Promise<UserModel[]>;

  existsByEmail(email: string): Promise<boolean>;
}
