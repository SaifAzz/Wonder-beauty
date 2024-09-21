import { Injectable, NotFoundException } from '@nestjs/common';
import { Driver, Order, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateRiderDto } from './rider.dto';

@Injectable()
export class RideService {
  private queue: Driver[] = [];

  constructor(private prisma: PrismaService) {}

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
  ): Promise<Order> {
    const order = await this.prisma.order.create({
      data: { origin, destination, customer, status: 'COMPLETED' },
    });

    await this.prisma.logEntry.create({
      data: {
        orderId: order.id,
        action: 'Order created',
      },
    });

    this.queue = await this.prisma.driver.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { priority: 'asc' },
    });

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

      return { status: 'Order assigned', driverId };
    } else {
      console.log(`Driver ${driverId} rejected the order`);
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
    if (this.queue.length === 0) {
      if (!retry) {
        console.log('Retrying with extended timeout...');
        this.queue = await this.prisma.driver.findMany({
          where: { status: 'AVAILABLE' },
          orderBy: { priority: 'asc' },
        });
        this.notifyDriver(orderId, true);
      } else {
        console.log('No drivers available for the order.');
      }
      return;
    }

    const driver = this.queue.shift();
    console.log(`Notifying driver ${driver.name} for order ${orderId}`);

    // Create a notification for the driver
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

  async createRider(createRiderDto: CreateRiderDto) {
    const data: Prisma.DriverCreateInput = {
      name: createRiderDto.name,
      priority: 0,
    };
    return await this.prisma.driver.create({ data });
  }

  async getAllRiders() {
    return this.prisma.driver.findMany();
  }

  async getRiderById(riderId: number) {
    const rider = await this.prisma.driver.findUnique({
      where: { id: riderId },
    });
    if (!rider) throw new NotFoundException('Rider not found');
    return rider;
  }
}
