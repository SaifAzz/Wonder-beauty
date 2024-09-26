import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderDto } from './createOrder.dto';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('order')
@ApiTags('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('new')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(
      createOrderDto.customer,
      createOrderDto.destination,
      createOrderDto.origin,
    );
  }

  // @Post('driver/respond')
  // async driverRespond(@Body() driverResponseDto: DriverResponseDto) {
  //   const { order_id, driver_id, response } = driverResponseDto;
  //   return this.orderService.handleDriverResponse(
  //     order_id,
  //     driver_id,
  //     response,
  //   );
  // }

  @Get('status/:order_id')
  async getOrderStatus(@Param('order_id', ParseIntPipe) order_id: number) {
    return this.orderService.getOrderStatus(order_id);
  }
}
