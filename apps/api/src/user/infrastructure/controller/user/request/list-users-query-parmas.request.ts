import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ListUsersQueryParamsSchema = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  q: z.string().optional(),
  role: z.enum(['ADMIN', 'VERIFIED_USER']).optional(),
  orderBy: z.enum(['createdAt', 'updatedAt', 'email']).optional().default('updatedAt'),
  order: z.enum(['DESC', 'ASC']).optional().default('DESC'),
});

export class ListUsersQueryParamsDto extends createZodDto(ListUsersQueryParamsSchema) {}
