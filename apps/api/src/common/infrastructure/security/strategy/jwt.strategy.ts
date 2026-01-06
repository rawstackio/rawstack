import { AsyncLocalStorage } from 'async_hooks';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoggedInUser } from '../../../domain/logged-in-user';
import { UserDtoProvider } from '../../../application/query/user/user.dto-provider';
import { Id } from "~/common/domain/model/value-object/id";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    protected readonly dtoProvider: UserDtoProvider,
    protected readonly als: AsyncLocalStorage<{ actor: LoggedInUser | null }>,
    @Inject('JWT_SECRET') jwtSecret: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<LoggedInUser> {
    const user = await this.dtoProvider.getById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const store = this.als.getStore();
    if (store) {
      store.actor = { id: new Id(user.id), roles: user.roles };
    }

    return {
      id: new Id(user.id),
      roles: user.roles,
    };
  }
}
