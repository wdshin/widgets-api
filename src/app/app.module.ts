import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentsModule } from 'src/payments/payments.module'
import { AppController } from './app.controller'

@Module({
  imports: [ConfigModule.forRoot(), PaymentsModule],
  controllers: [AppController],
})
export class AppModule {}
