import { TokenModel } from './token.model';
import { Id } from "~/common/domain/model/value-object/id";
import { Email } from "~/common/domain/model/value-object/email";

export interface TokenRepositoryInterface {
  persist(token: TokenModel): Promise<TokenModel>;

  findById(id: Id): Promise<TokenModel>;

  findByTokenHash(hash: string): Promise<TokenModel>;

  deleteAllByRootTokenId(id: Id, whereNotId?: boolean): Promise<void>;

  findTokenUserByEmail(email: Email, role?: string): Promise<{ hash: string; id: Id }>;
}
