import { Module } from '@nestjs/common';
import { RideService } from './riders.service';
import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { RiderController } from './riders.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [RideService, PrismaService],
  controllers: [RiderController],
  exports: [RideService],
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 600, // cache expiration time in seconds
      isGlobal: true, // Make CacheModule available globally (optional)
    }),
  ],
})
export class RidersModule {}
