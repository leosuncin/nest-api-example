import { Test, TestingModule } from '@nestjs/testing';

import { BrandController } from '~shop/controllers/brand.controller';
import type { CreateBrand } from '~shop/dtos/create-brand.dto';
import type { UpdateBrand } from '~shop/dtos/update-brand.dto';
import { Brand } from '~shop/entities/brand.entity';
import { brands } from '~shop/fixtures/brands';
import { BrandService } from '~shop/services/brand.service';

describe('BrandController', () => {
  let controller: BrandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrandService,
          useFactory(): jest.Mocked<Partial<BrandService>> {
            return {
              create: jest
                .fn()
                .mockImplementation((newBrand: CreateBrand) =>
                  Brand.fromPartial(newBrand),
                ),
              find: jest.fn().mockResolvedValue({
                items: brands,
                meta: {
                  currentPage: 1,
                  itemCount: brands.length,
                  itemsPerPage: 10,
                  totalItems: brands.length,
                  totalPages: 1,
                },
              }),
              remove: jest.fn().mockImplementation((brand: Brand) => {
                brand.deletedAt = new Date();

                return Promise.resolve(brand);
              }),
              update: jest
                .fn()
                .mockImplementation((brand: Brand, changes: UpdateBrand) =>
                  Promise.resolve(Object.assign(brand, changes)),
                ),
            };
          },
        },
      ],
      controllers: [BrandController],
    }).compile();

    controller = module.get<BrandController>(BrandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new brand', async () => {
    const newBrand: CreateBrand = { name: 'Acme Bicycles' };
    const brand = await controller.create(newBrand);

    expect(brand).toBeDefined();
    expect(brand).toMatchObject(newBrand);
  });

  it('should find the brands', async () => {
    const page = await controller.find({ page: 1, limit: 10 });

    expect(page).toBeDefined();
    expect(page.items).toHaveLength(brands.length);
    expect(page).toMatchObject({
      items: expect.arrayContaining([expect.any(Brand)]),
      meta: {
        currentPage: expect.any(Number),
        itemCount: expect.any(Number),
        itemsPerPage: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it('should get one brand', () => {
    const brand = controller.get(brands[0]!);

    expect(brand).toEqual(brand);
  });

  it('should update a brand', async () => {
    const brand = brands[0]!;
    const changes: UpdateBrand = { name: 'Acme Bike' };

    await expect(controller.update(brand, changes)).resolves.toHaveProperty(
      'name',
      'Acme Bike',
    );
  });

  it('should soft remove a brand', async () => {
    const brand = brands.at(-1)!;

    await expect(controller.remove(brand)).resolves.toHaveProperty(
      'deletedAt',
      expect.any(Date),
    );
  });
});
