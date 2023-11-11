import { Test, TestingModule } from '@nestjs/testing';

import { CategoryController } from '~shop/controllers/category.controller';
import type { CreateCategory } from '~shop/dtos/create-category.dto';
import type { UpdateCategory } from '~shop/dtos/update-category.dto';
import { Category } from '~shop/entities/category.entity';
import { categories } from '~shop/fixtures/categories';
import { CategoryService } from '~shop/services/category.service';

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CategoryService,
          useFactory(): jest.Mocked<Partial<CategoryService>> {
            return {
              create: jest
                .fn()
                .mockImplementation((newCategory: CreateCategory) =>
                  Category.fromPartial(newCategory),
                ),
              find: jest.fn().mockResolvedValue({
                items: categories,
                meta: {
                  currentPage: 1,
                  itemCount: categories.length,
                  itemsPerPage: 10,
                  totalItems: categories.length,
                  totalPages: 1,
                },
              }),
              remove: jest.fn().mockImplementation((category: Category) => {
                category.deletedAt = new Date();

                return Promise.resolve(category);
              }),
              update: jest
                .fn()
                .mockImplementation(
                  (category: Category, changes: UpdateCategory) =>
                    Promise.resolve(Object.assign(category, changes)),
                ),
            };
          },
        },
      ],
      controllers: [CategoryController],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new category', async () => {
    const newCategory: CreateCategory = { name: 'Acme Bicycles' };
    const category = await controller.create(newCategory);

    expect(category).toBeDefined();
    expect(category).toMatchObject(newCategory);
  });

  it('should find the categories', async () => {
    const page = await controller.find({ page: 1, limit: 10 });

    expect(page).toBeDefined();
    expect(page.items).toHaveLength(categories.length);
    expect(page).toMatchObject({
      items: expect.arrayContaining([expect.any(Category)]),
      meta: {
        currentPage: expect.any(Number),
        itemCount: expect.any(Number),
        itemsPerPage: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it('should get one category', () => {
    const category = controller.get(categories[0]!);

    expect(category).toEqual(category);
  });

  it('should update a category', async () => {
    const category = categories[0]!;
    const changes: UpdateCategory = { name: 'Acme Bike' };

    await expect(controller.update(category, changes)).resolves.toHaveProperty(
      'name',
      'Acme Bike',
    );
  });

  it('should soft remove a category', async () => {
    const category = categories.at(-1)!;

    await expect(controller.remove(category)).resolves.toHaveProperty(
      'deletedAt',
      expect.any(Date),
    );
  });
});
