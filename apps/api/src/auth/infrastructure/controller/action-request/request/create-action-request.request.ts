import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTokenActionRequestRequestSchema = z.object({
  token: z.string(),
});

export class CreateActionRequestRequest extends createZodDto(CreateTokenActionRequestRequestSchema) {}
