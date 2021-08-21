import { Module } from '@nestjs/common'
import { OverlaysGateway } from './overlays.gateway'

@Module({
  providers: [OverlaysGateway],
})
export class OverlaysModule {}
