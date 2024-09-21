import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'nestjs-prisma';
import { RidersModule } from 'src/riders/rider.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  imports: [RidersModule],
})
export class OrderModule {}
