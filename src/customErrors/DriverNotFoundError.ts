import { HttpException, HttpStatus } from '@nestjs/common';

export class DriverNotNotifiedException extends HttpException {
  constructor(driverId: number, orderId: number) {
    super(
      `Driver ${driverId} was not notified for order ${orderId}`,
      HttpStatus.FORBIDDEN,
    );
  }
}
