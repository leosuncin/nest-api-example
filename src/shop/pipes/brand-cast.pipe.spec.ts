// cSpell:ignore BYJGF
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { brands } from '~shop/fixtures/brands';
import { BrandCastPipe } from '~shop/pipes/brand-cast.pipe';
import { BrandService } from '~shop/services/brand.service';

describe('BrandCastPipe', () => {
  let pipe: BrandCastPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrandService,
          useFactory(): jest.Mocked<Partial<BrandService>> {
            return {
              get: jest
                .fn()
                .mockImplementation((id) =>
                  Promise.resolve(brands.find((brand) => brand.id === id)),
                ),
            };
          },
        },
        BrandCastPipe,
      ],
    }).compile();

    pipe = module.get<BrandCastPipe>(BrandCastPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform the value to a brand', async () => {
    const value = 'brand_MjQ2NzY2NjM0NDAzNzQ5ODg5';
    const brand = await pipe.transform(value);

    expect(brand).toBeDefined();
  });

  it('should throw a not found exception', async () => {
    await expect(
      pipe.transform('brand_nQBCbt7FCQ5T6keoIA9BYJGF'),
    ).rejects.toThrow(NotFoundException);
  });
});
