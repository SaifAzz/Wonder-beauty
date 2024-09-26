import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Driver, Order, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { DriverNotNotifiedException } from 'src/customErrors/DriverNotFoundError';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class RideService {
  private queue: Driver[] = [];

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createDriver(
    createDriverDto: Prisma.DriverCreateInput,
  ): Promise<Driver> {
    return await this.prisma.driver.create({
      data: createDriverDto,
    });
  }

  async createOrder(
    origin: string,
    destination: string,
    customer: string,
  ): Promise<any> {
    const order = await this.prisma.order.create({
      data: { origin, destination, customer, status: 'PENDING' },
    });

    await this.prisma.logEntry.create({
      data: {
        orderId: order.id,
        action: 'Order created',
      },
    });

    this.queue = await this.cacheManager.get<Driver[]>('driverQueue');

    if (!this.queue || this.queue.length === 0) {
      this.queue = await this.prisma.driver.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { priority: 'asc' },
      });
      await this.cacheManager.set('driverQueue', this.queue, 600);
    }

    this.notifyDriver(order.id);

    return order;
  }

  async handleDriverResponse(
    orderId: number,
    driverId: number,
    response: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const notification = await this.prisma.notification.findFirst({
      where: {
        orderId,
        driverId,
        status: 'PENDING',
      },
    });

    if (!notification) {
      throw new DriverNotNotifiedException(driverId, orderId);
    }

    if (response === 'accept') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { driverId, status: 'ASSIGNED' },
      });

      await this.prisma.driver.update({
        where: { id: driverId },
        data: { status: 'BUSY' },
      });

      await this.prisma.logEntry.create({
        data: {
          orderId,
          action: `Driver ${driverId} accepted the order`,
        },
      });

      await this.prisma.notification.updateMany({
        where: { orderId, driverId },
        data: { status: 'ACCEPTED' },
      });

      this.queue = this.queue.filter((driver) => driver.id !== driverId);
      await this.cacheManager.set('driverQueue', this.queue, 600);

      return { status: 'Order assigned', driverId };
    } else {
      await this.prisma.logEntry.create({
        data: {
          orderId,
          action: `Driver ${driverId} rejected the order`,
        },
      });
      this.notifyDriver(orderId);
    }
  }

  async notifyDriver(orderId: number, retry = false) {
    this.queue = await this.cacheManager.get<Driver[]>('driverQueue');

    if (!this.queue || this.queue.length === 0) {
      if (!retry) {
        console.log('Retrying with extended timeout...');
        this.queue = await this.prisma.driver.findMany({
          where: { status: 'AVAILABLE' },
          orderBy: { priority: 'asc' },
        });
        await this.cacheManager.set('driverQueue', this.queue, 600);
        this.notifyDriver(orderId, true);
      } else {
        console.log('No drivers available for the order.');
      }
      return;
    }

    const driver = this.queue.shift();
    await this.cacheManager.set('driverQueue', this.queue, 600);

    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        driverId: driver.id,
        orderId,
        status: 'PENDING',
      },
    });

    if (existingNotification) {
      console.log(
        `Driver ${driver.name} has already been notified for order ${orderId}`,
      );
      this.notifyDriver(orderId, retry);
      return;
    }

    console.log(`Notifying driver ${driver.name} for order ${orderId}`);

    await this.prisma.notification.create({
      data: {
        orderId,
        driverId: driver.id,
        status: 'PENDING',
        responseDeadline: new Date(Date.now() + 30 * 1000),
      },
    });

    setTimeout(
      async () => {
        console.log(`Waiting for driver ${driver.name}'s response...`);
        this.notifyDriver(orderId, retry);
      },
      retry ? 40000 : 30000,
    );
  }

  async getAllDrivers(): Promise<Driver[]> {
    return this.prisma.driver.findMany();
  }

  async getDriverById(driverId: number): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.prisma.order.findMany();
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
