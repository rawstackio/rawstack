import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
