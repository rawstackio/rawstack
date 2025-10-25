import AbstractApplicationException, { ErrorType } from './abstract-application.exception';

export default class DeserializationException extends AbstractApplicationException {
  readonly error: ErrorType = 'Unprocessable';
  readonly code = 420;
  readonly entityId?: { id: string; className: string };
}
