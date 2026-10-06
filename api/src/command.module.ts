import { Module } from '@nestjs/common';

import { SendWebhookCommand } from './integrations/send-webhook.command';

@Module({
  providers: [SendWebhookCommand],
})
export class CommandModule {}
