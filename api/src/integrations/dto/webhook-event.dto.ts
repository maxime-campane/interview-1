import { ExternalUser, ExternalUserUpdate } from './external-user.dto';

interface EventMetadata {
  eventId: string;
  occurredAt: string;
}

export type ExternalUserWebhookEvent = EventMetadata & (
  | { type: 'user.created'; data: ExternalUser }
  | { type: 'user.updated'; data: ExternalUserUpdate }
  | { type: 'user.deleted'; data: Pick<ExternalUser, 'id'> }
);
