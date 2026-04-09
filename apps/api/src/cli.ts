import { CommandFactory } from 'nest-commander';
import { CliModule } from '~/cli.module';

async function bootstrap() {
  try {
    await CommandFactory.run(CliModule, {
      logger: ['error'],
    });
    process.exit(0);
  } catch (err) {
    console.error('CLI command failed:', err);
    process.exit(1);
  }
}

bootstrap();
