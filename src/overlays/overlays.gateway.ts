import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

// lol. yes, that simple. no need to make it more complex
const OVERLAYS_STATE = {
  DEFAULT: {
    active: 0,
    options: {}
  },
  PLAYER_STAT: {
    active: 0,
    options: {}
  },
  BETTING_ODDS: {
    active: 0,
    options: {},
  },
  ROSHAN_TIMING: {
    active: 0,
    options: {},
  },
  TEAM_STAT: {
    active: 0,
    options: {},
  },
  TEAM_VS_TEAM_STAT: {
    active: 0,
    options: {}
  },
}

@WebSocketGateway({ cors: true })
export class OverlaysGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('get_overlays_state')
  async getOverlaysState(): Promise<object> {
    return OVERLAYS_STATE
  }

  @SubscribeMessage('set_overlays_state')
  async setOverlaysState(@MessageBody() data: SetOverlayState): Promise<object> {
    if (OVERLAYS_STATE[data.key]) {
      OVERLAYS_STATE[data.key].active = data.value;
      OVERLAYS_STATE[data.key].options = data.options;
    }

    return {
      success: true
    }
  }
}