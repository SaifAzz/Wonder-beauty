import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'The origin of the ride', example: 'Location A' })
  origin: string;

  @ApiProperty({
    description: 'The destination of the ride',
    example: 'Location B',
  })
  destination: string;

  @ApiProperty({ description: 'The name of the customer', example: 'Mhd Ali' })
  customer: string;
}
