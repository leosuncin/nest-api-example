import { User } from '~auth/entities/user.entity';
import { Allow, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateArticle {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly content!: string;

  @Allow()
  readonly author!: User;
}
