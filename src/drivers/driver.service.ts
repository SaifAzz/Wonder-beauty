import { Injectable } from '@nestjs/common';
import { Driver } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateDriverDto } from './creeateDriver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async createDriver(createDriverDto: CreateDriverDto): Promise<Driver> {
    return await this.prisma.driver.create({
      data: {
        name: createDriverDto.name,
        priority: createDriverDto.priority,
        status: createDriverDto.status,
      },
    });
  }
}
