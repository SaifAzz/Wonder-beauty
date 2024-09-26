import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'nestjs-prisma';
import { OrderModule } from './orders/order.module';
import { DriverModule } from './drivers/driver.module';
import { RidersModule } from './riders/rider.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore as any, // Type cast here to bypass the error
      host: 'localhost', // Replace with your Redis server host
      port: 6379, // Replace with your Redis server port
      ttl: 60, // Time to live in seconds
    }),
    PrismaModule,
    AuthModule,
    RidersModule,
    OrderModule,
    DriverModule,
  ],
})
export class AppModule {}
