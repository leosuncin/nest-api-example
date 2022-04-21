import { teardown } from 'jest-dev-server';

async function globalTeardown() {
  await teardown();
}

export default globalTeardown;
