import type { LoginUser } from '~auth/dto/login-user.dto';
import type { RegisterUser } from '~auth/dto/register-user.dto';

export const login = Object.freeze<LoginUser>({
  password: 'Th€Pa$$w0rd!',
  username: 'john-doe',
});

export const register = Object.freeze<RegisterUser>({
  ...login,
  email: 'john@doe.me',
});
