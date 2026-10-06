import { Injectable, NotImplementedException } from '@nestjs/common';

import { FakeEmailService } from '../emails/fake-email.service';
import { ExternalUserWebhookEvent } from './dto/webhook-event.dto';
import { UserStoreService } from '../users/user-store.service';

@Injectable()
export class UserWebhookService {
  constructor(
    private readonly userStore: UserStoreService,
    private readonly emailService: FakeEmailService,
  ) {}

  async processEvent(event: ExternalUserWebhookEvent): Promise<void> {
    // Votre pseudo-code ou vos commentaires ici.
    throw new NotImplementedException('Traitement webhook à compléter pendant l’entretien.');
  }
}
