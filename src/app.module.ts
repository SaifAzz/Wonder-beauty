import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'nestjs-prisma';
import { OrderModule } from './orders/order.module';
import { DriverModule } from './drivers/driver.module';
import { RidersModule } from './riders/rider.module';

@Module({
  imports: [PrismaModule, AuthModule, RidersModule, OrderModule, DriverModule],
})
export class AppModule {}
