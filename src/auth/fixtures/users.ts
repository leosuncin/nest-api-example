import { User } from '~auth/entities/user.entity';
import { register as credentials } from '~auth/fixtures/credentials';

export const john = User.fromPartial({
  ...credentials,
  // https://viralpostgenerator.com/?target=afovb6hntfnzu5g2jhzmog7v2&params=%7B%227kv7s6nygtu1ekglln3yja4q4.t_cmjbbsk9rx7bo03qwqm64185e%22%3A1148867%7D
  bio: `My secret career hack?

  Here it is:

  Simply be the best.

  Once you manage to do that, you'll get 10x salary.

  If you need to get started, you can build a new project.

  That's the first step. And it's easy.

  I, too, built a new project and grew from there. It taught me a lot.

  Go build a new project NOW and share on the Internet once you finish!`,
  id: '0e6b9a6c-ea3b-4e39-8b17-f8e6623a17a5',
  image: 'https://randomuser.me/api/portraits/men/93.jpg',
  checkPassword(plainPassword: string) {
    return Promise.resolve(plainPassword === this.password);
  },
});

export const jane = User.fromPartial({
  // https://viralpostgenerator.com/?target=2wihmikgrigi82grn74nvdmjw&params=%7B%227kv7s6nygtu1ekglln3yja4q4.t_cmjbbsk9rx7bo03qwqm64185e%22%3A1148896%7D
  bio: `I started a new job today.
  (Congratulations to me… 🎉)

  First thing I did?
  As soon as I sat at my new desk, I got a salary increase.

  Yup!!!

  My new colleagues looked at me in shock. “I got at home”, one of them said. And then someone else got a salary increase too right next to me. The rest... suddenly followed.

  This is when I realized: It doesn’t matter WHERE I do it, as long as I'll never surrender.

  Bottom line? You can get a salary increase in the office too.
  🎤🖐 Mic drop.`,
  email: 'jane@doe.me',
  id: '63770485-6ee9-4a59-b374-3f194091e2e1',
  image: 'https://randomuser.me/api/portraits/women/68.jpg',
  password: credentials.password,
  username: 'jane-doe',
  checkPassword(plainPassword: string) {
    return Promise.resolve(plainPassword === this.password);
  },
});
