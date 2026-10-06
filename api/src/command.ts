import 'reflect-metadata';
import { CommandFactory } from 'nest-commander';

import { CommandModule } from './command.module';

void CommandFactory.run(CommandModule, {
  errorHandler: (error) => {
    throw error;
  },

  serviceErrorHandler: (error) => {
    if ('exitCode' in error && error.exitCode === 0) {
      return;
    }

    console.error(error.message);
    process.exitCode = 1;
  },
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
