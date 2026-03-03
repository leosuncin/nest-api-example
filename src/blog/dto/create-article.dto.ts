import { Allow, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { User } from '~auth/entities/user.entity';

export class CreateArticle {
  @Allow()
  readonly author!: User;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly content!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly title!: string;
}
