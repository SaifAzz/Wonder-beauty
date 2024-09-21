import { Module } from '@nestjs/common';
import { RideService } from './riders.service';
import { PrismaService } from 'nestjs-prisma';
import { RiderController } from './riders.controller';

@Module({
  providers: [RideService, PrismaService],
  controllers: [RiderController],
  exports: [RideService],
})
export class RidersModule {}
