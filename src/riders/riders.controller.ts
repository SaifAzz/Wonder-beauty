import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RideService } from './riders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/rider')
@ApiTags('Riders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RiderController {
  constructor(private rideService: RideService) {}

  // @Post('create')
  // @ApiBody({ type: CreateRiderDto })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Rider successfully created.',
  //   schema: {
  //     example: { status: 'Rider created', rider_id: 1 },
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Invalid input.' })
  // async createRider(@Body() createRiderDto: CreateRiderDto) {
  //   const rider = await this.rideService.createRider(createRiderDto);
  //   return { status: 'Rider created', rider_id: rider.id };
  // }

  // @Get('all')
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return all riders.',
  //   schema: {
  //     example: [{ id: 1, name: 'Rider A' }],
  //   },
  // })
  // async getAllRiders() {
  //   return this.rideService.getAllRiders();
  // }

  // @Get(':id')
  // @ApiParam({ name: 'id', description: 'Rider ID', example: 1 })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return rider details.',
  //   schema: {
  //     example: { id: 1, name: 'Rider A' },
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'Rider not found.' })
  // async getRiderById(@Param('id') id: number) {
  //   return this.rideService.getRiderById(id);
  // }
}
