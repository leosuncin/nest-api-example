import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegisterUser } from '@/auth/dto/register-user.dto';
import { User } from '@/auth/entities/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  register(newUser: RegisterUser): Promise<User> {
    const user = this.userRepository.create(newUser);

    return this.userRepository.save(user);
  }
}
