import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRoles } from '~/common/domain/enum/user-roles';

export const UpdateUserRequestSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRoles)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Email, password, or roles must be provided',
  });

export class UpdateUserRequest extends createZodDto(UpdateUserRequestSchema) {}
