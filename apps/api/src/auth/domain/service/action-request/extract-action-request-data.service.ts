import { TokenVerifierInterface } from '~/common/domain/token-verifier.interface';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';
import { ActionData, ActionType } from '~/auth/domain/model/action-request/action-request.model';
import { Id } from "~/common/domain/model/value-object/id";
import {Email} from "~/common/domain/model/value-object/email";

type Payload = { email: string; id: string; userId: string; type: string };
type ExtractedData = { action: ActionType; data: ActionData };

export class ExtractActionRequestDataService {
  constructor(private readonly jwtVerifier: TokenVerifierInterface) {}

  async invoke(token: string): Promise<ExtractedData> {
    const data = await this.jwtVerifier.verify<Payload>(token);

    // the only action currently supported is EMAIL_VERIFICATION
    if (data.type !== 'EMAIL_VERIFICATION') {
      throw new UnauthorizedException('Invalid token type');
    }

    return {
      action: 'EMAIL_VERIFICATION',
      data: {
        tokenId: new Id(data.id),
        userId: new Id(data.userId),
        email: data.email ? new Email(data.email) : undefined,
      },
    };
  }
}
