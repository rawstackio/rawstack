import AbstractApplicationException, { ErrorType } from './abstract-application.exception';

export default class EntityNotFoundException extends AbstractApplicationException {
  readonly error: ErrorType = 'Not Found';
  readonly code = 404;
}
