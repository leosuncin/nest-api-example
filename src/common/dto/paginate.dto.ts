import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class Paginate {
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value as string))
  @IsPositive()
  @Max(100)
  readonly limit = 10;

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value as string))
  @IsPositive()
  readonly page = 1;
}
