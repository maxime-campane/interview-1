import { Command, CommandRunner } from 'nest-commander';

import { ExternalUserWebhookEvent } from './dto/webhook-event.dto';

interface WebhookScenario {
  key: string;
  title: string;
  files: string[];
}

const SCENARIOS: WebhookScenario[] = require('../../examples/webhook-scenarios.json');
const WEBHOOK_URL = 'http://127.0.0.1:3101/integrations/hr/users/webhook';

@Command({
  name: 'send-webhook',
  arguments: '[verb]',
  description:
    'Envoie les événements fictifs au webhook local. Avec all : tous les scénarios. Avec list : affiche les commandes disponibles.',
})
export class SendWebhookCommand extends CommandRunner {
  async run(passedParams: string[]): Promise<void> {
    const key = passedParams[0] ?? 'all';

    if (key === 'list') {
      for (const scenario of SCENARIOS) {
        console.log(`pnpm send-webhook:${scenario.key} : ${scenario.title}`);
      }

      return;
    }

    const scenarios = key === 'all'
      ? SCENARIOS
      : SCENARIOS.filter((scenario) => scenario.key === key);

    if (scenarios.length === 0) {
      throw new Error(`Scénario inconnu : ${key}. Utilisez pnpm send-webhook:list.`);
    }

    console.log(`Webhook : ${WEBHOOK_URL}`);

    let accepted = 0;
    let rejected = 0;
    let serverErrors = 0;

    for (const scenario of scenarios) {
      console.log(`\n${scenario.key} : ${scenario.title}`);

      for (const file of scenario.files) {
        const event: ExternalUserWebhookEvent = require(`../../examples/${file}`);

        let response: Response;
        let body: string;

        try {
          response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            signal: AbortSignal.timeout(5_000),
            redirect: 'error',
          });

          body = await response.text();
        } catch {
          throw new Error(
            `Envoi impossible pour ${event.eventId}. Vérifiez que l’API locale répond sur le port 3101, avec pnpm dev:api.`,
          );
        }

        console.log(
          `  ${file} | ${event.eventId} | ${event.type} | ${event.data.id} → HTTP ${response.status}`,
        );

        if (body) {
          console.log(`  Réponse : ${body}`);
        }

        if (response.ok) {
          accepted += 1;
        } else {
          rejected += 1;
        }

        if (response.status >= 500) {
          serverErrors += 1;
        }
      }
    }

    console.log(
      `\n${accepted + rejected} envois : ${accepted} réponses 2xx, ${rejected} autres réponses.`,
    );

    console.log(
      'Vérifiez aussi les données et les logs : un statut HTTP ne prouve pas que le traitement est correct.',
    );

    if (serverErrors > 0) {
      process.exitCode = 1;
    }
  }
}
