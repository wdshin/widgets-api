import { Module } from '@nestjs/common'
import { SocketService } from 'src/common/socket.service'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, SocketService],
})
export class PaymentsModule {}
