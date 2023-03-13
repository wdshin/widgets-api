import { Injectable } from '@nestjs/common'
import { SocketService } from '../common/socket.service'
import { IPaymentsEvent } from './interfaces/payments.interfaces'

@Injectable()
export class PaymentsService {
  constructor(private readonly socketService: SocketService) {}

  sendPaymentData(paymentData: IPaymentsEvent) {
    const { amount, text, nickname, clientId } = paymentData

    const message = {
      amount,
      text,
      nickname,
    }

    const clientSocket = this.socketService.getClientSocket(clientId)

    if (!clientSocket) {
      return {
        ok: false,
        message: 'Client is not online',
      }
    }

    clientSocket.emit('payment', message)

    return {
      ok: true,
    }
  }
}
