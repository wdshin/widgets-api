import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: true })
export class OverlaysGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('get_overlays_state')
  getOverlaysState() {
    return 'erw'
  }

  @SubscribeMessage('set_overlays_state')
  setOverlaysState(@MessageBody() data) {
    return {
      success: true,
    }
  }
}
