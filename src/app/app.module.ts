import { Module } from '@nestjs/common'
import { OverlaysModule } from 'src/overlays/overlays.module'
import { AppController } from './app.controller'

@Module({
  imports: [OverlaysModule],
  controllers: [AppController],
})
export class AppModule {}
