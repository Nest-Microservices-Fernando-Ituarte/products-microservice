import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');
  onModuleInit() {
    this.$connect();
    this.logger.log(`Database connected...`);
  }
  async create(createProductDto: CreateProductDto) {
    return await this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalProducts = await this.product.count({
      where: { available: true },
    });
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await this.product.findMany({
      where: { available: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      meta: { totalPages: totalPages, total: totalProducts, page: page },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (product) {
      return product;
    }

    throw new NotFoundException(`No product found with id: ${id}`);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    delete updateProductDto.id;
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: updateProductDto,
    });
    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    return product;
  }
}
