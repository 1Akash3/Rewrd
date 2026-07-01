import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Loyalty OS API listening on ${env.apiBaseUrl} (env: ${env.nodeEnv})`);
  console.log(`  Health: ${env.apiBaseUrl}/health\n`);
});
