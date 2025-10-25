import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ListUsersQueryParamsSchema = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  q: z.string().optional(),
});

export class ListUsersQueryParamsDto extends createZodDto(ListUsersQueryParamsSchema) {}
