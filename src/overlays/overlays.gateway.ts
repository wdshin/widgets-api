import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

// lol. yes, that simple. no need to make it more complex
const OVERLAYS_STATE = {
  DEFAULT: 0,
  HERO_STAT: 0,
}

@WebSocketGateway(5000, { cors: true })
export class OverlaysGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('get_overlays_state')
  async getOverlaysState(): Promise<object> {
    return OVERLAYS_STATE
  }

  @SubscribeMessage('set_overlays_state')
  async setOverlaysState(@MessageBody() data: SetOverlayState): Promise<object> {
    OVERLAYS_STATE[data.key] = data.value;

    return {
      success: true
    }
  }
}