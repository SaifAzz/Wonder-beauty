import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RideService } from 'src/riders/riders.service';
import { CreateDriverDto } from './creeateDriver.dto';
import { DriverResponseDto } from 'src/orders/createOrderResponse.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Drivers')
@Controller('api/driver')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DriverController {
  constructor(private rideService: RideService) {}

  @Post('create')
  @ApiBody({ type: CreateDriverDto })
  @ApiResponse({
    status: 201,
    description: 'Driver successfully created.',
    schema: {
      example: { status: 'Driver created', driver_id: 1 },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async createDriver(@Body() createDriverDto: CreateDriverDto) {
    const driver = await this.rideService.createDriver(createDriverDto);
    return { status: 'Driver created', driver_id: driver.id };
  }

  @Post('respond')
  @ApiBody({ type: DriverResponseDto })
  @ApiResponse({
    status: 200,
    description: 'Driver response successfully handled.',
    schema: {
      example: { status: 'Order assigned to you', driver_id: 1 },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async driverResponse(@Body() responseDto: DriverResponseDto) {
    const { order_id, driver_id, response } = responseDto;
    const result = await this.rideService.handleDriverResponse(
      order_id,
      driver_id,
      response,
    );
    return result;
  }

  // @Get('all')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return all drivers.',
  //   schema: {
  //     example: [{ id: 1, name: 'Driver A', status: 'available' }],
  //   },
  // })
  // async getAllDrivers() {
  //   return this.rideService.getAllDrivers();
  // }

  // @Get(':id')
  // @ApiParam({ name: 'id', description: 'Driver ID', example: 1 })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return driver details.',
  //   schema: {
  //     example: { id: 1, name: 'Driver A', status: 'available' },
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'Driver not found.' })
  // async getDriverById(@Param('id') id: number) {
  //   return this.rideService.getDriverById(id);
  // }
}
