import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { categories } from '~shop/fixtures/categories';
import { CategoryCastPipe } from '~shop/pipes/category-cast.pipe';
import { CategoryService } from '~shop/services/category.service';

describe('CategoryCastPipe', () => {
  let pipe: CategoryCastPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CategoryService,
          useFactory(): jest.Mocked<Partial<CategoryService>> {
            return {
              get: jest
                .fn()
                .mockImplementation((id) =>
                  Promise.resolve(
                    categories.find((category) => category.id === id),
                  ),
                ),
            };
          },
        },
        CategoryCastPipe,
      ],
    }).compile();

    pipe = module.get<CategoryCastPipe>(CategoryCastPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform the value to a category', async () => {
    const value = 'category_MjQ2MDI5MTAyNjczMzA1NjAy';
    const category = await pipe.transform(value);

    expect(category).toBeDefined();
  });

  it('should throw a not found exception', async () => {
    await expect(pipe.transform('category_nQBCbt7FCQ5T6keoIA9BYJGF')).rejects.toThrow(
      NotFoundException,
    );
  });
});
