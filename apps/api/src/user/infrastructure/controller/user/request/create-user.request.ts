import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
});

export class CreateUserRequest extends createZodDto(CreateUserRequestSchema) {}
