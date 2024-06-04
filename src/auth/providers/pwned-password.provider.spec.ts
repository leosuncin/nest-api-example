import { register as credentials } from '~auth/fixtures/credentials';
import { hasPasswordBeenPwned } from '~auth/providers/pwned-password.provider';
import nock, {
  back as nockBack,
  cleanAll,
  enableNetConnect,
  restore,
} from 'nock';
import { resolve } from 'node:path';

describe('pwnedPassword provider', () => {
  beforeAll(() => {
    nockBack.fixtures = resolve(__dirname, '__fixtures__');
    nockBack.setMode('lockdown');

    nock('https://api.pwnedpasswords.com')
      .persist()
      .replyDate()
      .get(/range\/\w{5}/u);
  });

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    cleanAll();
    enableNetConnect();
  });

  it('should check whether the password has been exposed', async () => {
    const { nockDone } = await nockBack('is-insecure.json');
    const password = 'password';

    const firstTime = await hasPasswordBeenPwned(password);

    expect(firstTime).toBeGreaterThanOrEqual(9_545_824);

    nockDone();

    const secondTime = await hasPasswordBeenPwned(password);

    expect(secondTime).toBe(firstTime);
  });

  it('should check whether the password has never been exposed', async () => {
    const { nockDone } = await nockBack('is-secure.json');

    const firstTime = await hasPasswordBeenPwned(credentials.password);

    expect(firstTime).toBeLessThanOrEqual(0);

    nockDone();

    const secondTime = await hasPasswordBeenPwned(credentials.password);

    expect(secondTime).toBe(firstTime);
  });
});
