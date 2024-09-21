import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { RidersModule } from 'src/riders/rider.module';

@Module({
  imports: [RidersModule],
  controllers: [DriverController],
  providers: [DriverService, PrismaService],
})
export class DriverModule {}
