import { TokenModel } from './token.model';

export interface TokenRepositoryInterface {
  persist(token: TokenModel): Promise<TokenModel>;

  findById(id: string): Promise<TokenModel>;

  findByTokenHash(hash: string): Promise<TokenModel>;

  deleteAllByRootTokenId(id: string, whereNotId?: boolean): Promise<void>;

  findTokenUserByEmail(email: string, role?: string): Promise<{ hash: string; id: string }>;
}
