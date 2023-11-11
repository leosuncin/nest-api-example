import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockInstance } from 'jest-create-mock-instance';
import { Repository } from 'typeorm';

import { Category } from '~shop/entities/category.entity';
import { categories } from '~shop/fixtures/categories';
import { CategoryService } from '~shop/services/category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Category),
          useFactory() {
            const mock = createMockInstance<Repository<Category>>(Repository);

            mock.create.mockImplementation((dto) => Category.fromPartial(dto));
            mock.save.mockImplementation((entity) =>
              Promise.resolve(entity as Category),
            );
            mock.find.mockResolvedValue(categories as unknown as Category[]);
            mock.count.mockResolvedValue(categories.length);
            mock.findOneBy.mockImplementation(
              // @ts-expect-error mock findOneBy
              ({ id }: Record<'id', Category['id']>) =>
                categories.find((category) => category.id === id),
            );
            mock.merge.mockImplementation(
              (entity, dto) => Object.assign(entity, dto) as Category,
            );
            mock.softRemove.mockImplementation((entity) => {
              entity.deletedAt = new Date();

              return Promise.resolve(entity as Category);
            });
            // Patch the mock so instanceof Repository works
            Object.setPrototypeOf(mock, Repository.prototype);

            return mock;
          },
        },
        CategoryService,
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new category', async () => {
    const newCategory = { name: 'Acme Bicycles' };
    const category = await service.create(newCategory);

    expect(category).toBeDefined();
    expect(category).toMatchObject(newCategory);
  });

  it('should find the categories', async () => {
    const page = await service.find({ page: 1, limit: 10 });

    expect(page).toBeDefined();
    expect(page.items).toHaveLength(categories.length);
    expect(page).toMatchObject({
      items: expect.arrayContaining([expect.any(Category)]),
      meta: {
        currentPage: 1,
        itemCount: categories.length,
        itemsPerPage: 10,
        totalItems: categories.length,
        totalPages: 1,
      },
    });
  });

  it('should get one category by id', async () => {
    const category = await service.get(categories[0]!.id);

    expect(category).toBeDefined();
    expect(category).toMatchObject({
      id: expect.stringMatching('category_'),
      name: expect.any(String),
    });
  });

  it('should update a category', async () => {
    const category = categories[0]!;
    const changes = { name: 'Acme Bike' };

    await expect(service.update(category, changes)).resolves.toHaveProperty(
      'name',
      'Acme Bike',
    );
  });

  it('should soft remove a category', async () => {
    const category = categories.at(-1)!;

    await expect(service.remove(category)).resolves.toHaveProperty(
      'deletedAt',
      expect.any(Date),
    );
  });
});
