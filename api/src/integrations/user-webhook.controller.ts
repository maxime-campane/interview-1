import { Body, Controller, Post } from '@nestjs/common';
import { ExternalUserWebhookEvent } from './dto/webhook-event.dto';
import { UserWebhookService } from './user-webhook.service';

@Controller('integrations/hr/users')
export class UserWebhookController {
  constructor(private readonly userWebhookService: UserWebhookService) {}

  @Post('webhook')
  receive(@Body() event: ExternalUserWebhookEvent): Promise<void> {
    return this.userWebhookService.processEvent(event);
  }
}
