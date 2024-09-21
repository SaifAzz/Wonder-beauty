import { ApiProperty } from '@nestjs/swagger';

export class DriverResponseDto {
  @ApiProperty({ description: 'The order ID', example: 12345 })
  order_id: number;

  @ApiProperty({ description: 'The driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'The driver response', example: 'accept' })
  response: string;
}
