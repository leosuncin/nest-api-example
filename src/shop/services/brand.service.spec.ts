import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockInstance } from 'jest-create-mock-instance';
import { Repository } from 'typeorm';

import { Brand } from '~shop/entities/brand.entity';
import { brands } from '~shop/fixtures/brands';
import { BrandService } from '~shop/services/brand.service';

describe('BrandService', () => {
  let service: BrandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Brand),
          useFactory() {
            const mock = createMockInstance<Repository<Brand>>(Repository);

            mock.create.mockImplementation((dto) => Brand.fromPartial(dto));
            mock.save.mockImplementation((entity) =>
              Promise.resolve(entity as Brand),
            );
            mock.find.mockResolvedValue(brands as unknown as Brand[]);
            mock.count.mockResolvedValue(brands.length);
            mock.findOneBy.mockImplementation(
              // @ts-expect-error mock findOneBy
              ({ id }: Record<'id', Brand['id']>) =>
                brands.find((brand) => brand.id === id),
            );
            mock.merge.mockImplementation(
              (entity, dto) => Object.assign(entity, dto) as Brand,
            );
            mock.softRemove.mockImplementation((entity) => {
              entity.deletedAt = new Date();

              return Promise.resolve(entity as Brand);
            });
            // Patch the mock so instanceof Repository works
            Object.setPrototypeOf(mock, Repository.prototype);

            return mock;
          },
        },
        BrandService,
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new brand', async () => {
    const newBrand = { name: 'Acme' };
    const brand = await service.create(newBrand);

    expect(brand).toBeDefined();
    expect(brand).toMatchObject(newBrand);
  });

  it('should find the categories', async () => {
    const page = await service.find({ page: 1, limit: 10 });

    expect(page).toBeDefined();
    expect(page.items).toHaveLength(brands.length);
    expect(page).toMatchObject({
      items: expect.arrayContaining([expect.any(Brand)]),
      meta: {
        currentPage: 1,
        itemCount: brands.length,
        itemsPerPage: 10,
        totalItems: brands.length,
        totalPages: 1,
      },
    });
  });

  it('should get one brand by id', async () => {
    const brand = await service.get(brands[0]!.id);

    expect(brand).toBeDefined();
    expect(brand).toMatchObject({
      id: expect.stringMatching('brand_'),
      name: expect.any(String),
    });
  });

  it('should update a brand', async () => {
    const brand = brands[0]!;
    const changes = { name: 'Acme' };

    await expect(service.update(brand, changes)).resolves.toHaveProperty(
      'name',
      'Acme',
    );
  });

  it('should soft remove a brand', async () => {
    const brand = brands.at(-1)!;

    await expect(service.remove(brand)).resolves.toHaveProperty(
      'deletedAt',
      expect.any(Date),
    );
  });
});
