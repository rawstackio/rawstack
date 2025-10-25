import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTokenRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  refreshToken: z.string().optional(),
  role: z.enum(['ADMIN']).optional(),
  invalidateTokens: z.boolean().optional(),
});

export class CreateTokenRequest extends createZodDto(CreateTokenRequestSchema) {}
