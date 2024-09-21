import { ApiProperty } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the customer', example: 'Mhd Ali' })
  name: string;

  @IsString()
  @IsNotEmpty()
  status: DriverStatus;

  @IsInt()
  @ApiProperty({ description: 'The name of the customer', example: '1' })
  @IsNotEmpty()
  priority: number;
}
