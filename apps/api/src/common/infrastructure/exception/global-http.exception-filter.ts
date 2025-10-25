import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import AbstractApplicationException from '~/common/application/exception/abstract-application.exception';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { ForbiddenException as DomainForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { UnauthorizedException as DomainUnauthorizedException } from '~/common/domain/exception/unauthorized.exception';
import { ConflictException } from '~/common/domain/exception/conflict.exception';
import { ValidationException } from '~/common/domain/exception/validation.exception';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class GlobalHttpExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Validation
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      // Flatten and keep useful details (message, path, code)
      const issues = zodError.issues.map((i) => ({
        message: i.message,
        path: i.path.join('.'),
        code: i.code,
      }));
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation Error',
        issues: issues,
      });
    } else if (exception instanceof EntityNotFoundException) {
      // Domain exceptions
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      });
    } else if (exception instanceof DomainForbiddenException || exception instanceof ForbiddenException) {
      res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: exception.message,
        error: 'Forbidden',
      });
    } else if (exception instanceof DomainUnauthorizedException || exception instanceof UnauthorizedException) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
        error: 'Unauthorized',
      });
    } else if (exception instanceof ConflictException) {
      res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'Conflict',
      });
    } else if (exception instanceof ValidationException) {
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        error: 'Unprocessable',
      });
    } else if (exception instanceof AbstractApplicationException) {
      // Application exceptions
      res.status(exception.code).json({
        statusCode: exception.code,
        message: exception.message,
        error: exception.error,
      });
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      res.status(status).json({
        statusCode: status,
        ...(typeof body === 'string' ? { message: body } : body),
      });
    } else {
      // Delegate to Nest's default error handler
      super.catch(exception, host);
    }
  }
}
