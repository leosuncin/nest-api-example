import 'dotenv/config';

import { setup } from 'jest-dev-server';

async function globalSetup() {
  await setup({
    command: 'npm run start:dev',
    port: 3000,
    usedPortAction: 'ignore',
  });
}

export default globalSetup;
