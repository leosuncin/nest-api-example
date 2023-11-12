import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateBrand {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name!: string;
}
