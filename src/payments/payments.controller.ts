import { Body, Controller, Post } from '@nestjs/common'
import { IPaymentsEvent } from './interfaces/payments.interfaces'
import { PaymentsService } from './payments.service'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(@Body() paymentData: IPaymentsEvent) {
    return this.paymentsService.sendPaymentData(paymentData)
  }
}
