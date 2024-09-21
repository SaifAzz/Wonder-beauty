import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrderDto } from './createOrder.dto';
import { Driver } from '@prisma/client';
import { RideService } from 'src/riders/riders.service';

@Injectable()
export class OrderService {
  private queue: Driver[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly rideService: RideService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const newOrder = await this.prisma.order.create({
      data: {
        origin: createOrderDto.origin,
        destination: createOrderDto.destination,
        customer: createOrderDto.customer,
        status: 'PENDING',
      },
    });

    await this.logOrderAction(newOrder.id, 'Order created');

    const firstDriver = await this.prisma.driver.findFirst({
      where: { status: 'AVAILABLE' },
      orderBy: { priority: 'asc' },
    });

    if (firstDriver) {
      await this.rideService.notifyDriver(newOrder.id);
    }

    return {
      status: 'Order created',
      order_id: newOrder.id,
    };
  }

  async handleDriverResponse(
    orderId: number,
    driverId: number,
    response: string,
  ) {
    await this.getOrderById(orderId);

    if (response === 'accept') {
      await this.assignOrderToDriver(orderId, driverId);
      return { status: 'Order assigned', driverId };
    } else {
      await this.logOrderAction(
        orderId,
        `Driver ${driverId} rejected the order`,
      );
      this.notifyDriver(orderId);
    }
  }

  private async assignOrderToDriver(orderId: number, driverId: number) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { driverId, status: 'ASSIGNED' },
    });

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'BUSY' },
    });

    await this.logOrderAction(orderId, `Driver ${driverId} accepted the order`);
    this.queue = this.queue.filter((driver) => driver.id !== driverId);

    await this.prisma.notification.updateMany({
      where: { orderId, driverId },
      data: { status: 'ACCEPTED' },
    });
  }

  private async logOrderAction(orderId: number, action: string) {
    await this.prisma.logEntry.create({
      data: { orderId, action },
    });
  }

  private async getOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
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

    await this.prisma.notification.create({
      data: {
        orderId,
        driverId: driver.id,
        status: 'PENDING',
        responseDeadline: new Date(Date.now() + 30 * 1000),
      },
    });

    setTimeout(
      () => {
        console.log(`Waiting for driver ${driver.name}'s response...`);
        this.notifyDriver(orderId, retry);
      },
      retry ? 40000 : 30000,
    );
  }

  async getOrderStatus(order_id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: order_id },
      include: { driver: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    let waiting_driver = null;

    if (order.status === 'PENDING') {
      const availableDrivers = await this.prisma.driver.findMany({
        where: {},
        orderBy: {
          priority: 'asc',
        },
        take: 1,
      });

      if (availableDrivers.length > 0) {
        waiting_driver = availableDrivers[0].id;
      }
    }

    if (order.status === 'ASSIGNED') {
      return {
        order_id: order.id,
        status: 'Assigned',
        assigned_to_driver: order.driverId,
        time: order.updatedAt,
      };
    } else {
      return {
        order_id: order.id,
        status: 'Pending',
        waiting_driver: waiting_driver || 'No available drivers',
        round: '1',
      };
    }
  }
}
