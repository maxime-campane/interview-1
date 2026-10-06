import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { FakeEmailService } from './emails/fake-email.service';
import { ManagementResolver } from './management.resolver';
import { UserWebhookController } from './integrations/user-webhook.controller';
import { UserWebhookService } from './integrations/user-webhook.service';
import { UserStoreService } from './users/user-store.service';
import { FakeUploadService } from './uploads/fake-upload.service';
import { UploadsController } from './uploads/uploads.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: false,
    }),
  ],
  controllers: [
    UserWebhookController,
    UploadsController,
  ],
  providers: [
    ManagementResolver,
    UserStoreService,
    UserWebhookService,
    FakeEmailService,
    FakeUploadService,
  ],
})
export class AppModule {}
