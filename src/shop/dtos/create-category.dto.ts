import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategory {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name!: string;
}
