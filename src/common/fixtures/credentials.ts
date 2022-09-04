import type { LoginUser } from '@/auth/dto/login-user.dto';

export const credentials = Object.freeze<LoginUser>({
  password: 'Th€Pa$$w0rd!',
  username: 'john-doe',
});
