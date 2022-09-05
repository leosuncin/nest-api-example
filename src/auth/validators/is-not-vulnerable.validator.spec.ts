import { validate } from 'class-validator';
import nock, {
  back as nockBack,
  cleanAll,
  enableNetConnect,
  restore,
} from 'nock';
import { resolve } from 'node:path';

import { login as credentials } from '~auth/fixtures/credentials';
import { IsNotVulnerable } from '~auth/validators/is-not-vulnerable.validator';

class DTO {
  @IsNotVulnerable()
  readonly password: string;

  constructor(password: string) {
    this.password = password;
  }
}

describe('IsNotVulnerablePassword', () => {
  beforeAll(() => {
    nockBack.fixtures = resolve(__dirname, '__fixtures__');
    nockBack.setMode('lockdown');

    nock('https://api.pwnedpasswords.com')
      .persist()
      .replyDate()
      .get(/range\/\w{5}/);
  });

  afterEach(() => {
    restore();
  });

  afterAll(() => {
    cleanAll();
    enableNetConnect();
  });

  it('should check if the password is insecure when it has been exposed', async () => {
    const { nockDone } = await nockBack('is-insecure.json');
    const dto = new DTO('password');

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);

    nockDone();
  });

  it('should check if the password is secure when it has never been exposed', async () => {
    const { nockDone } = await nockBack('is-secure.json');
    const dto = new DTO(credentials.password);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);

    nockDone();
  });
});
