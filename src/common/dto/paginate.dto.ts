import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class Paginate {
  @IsOptional()
  @IsPositive()
  @Max(100)
  @Transform(({ value }) => Number.parseInt(value as string, 10))
  readonly limit = 10;

  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => Number.parseInt(value as string, 10))
  readonly page = 1;
}
