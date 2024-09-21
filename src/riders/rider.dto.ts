import { ApiProperty } from '@nestjs/swagger';

export class CreateRiderDto {
  @ApiProperty({ example: 'Rider A', description: 'The name of the rider' })
  name: string;

  @ApiProperty({ example: 1, description: 'Priority of the rider' })
  priority: number;
}
