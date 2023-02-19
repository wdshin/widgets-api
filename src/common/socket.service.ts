import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

@Injectable()
export class SocketService {
  private io: Server
  private clientMap: Map<string, Socket>

  createSocketServer(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })
    this.clientMap = new Map<string, Socket>()

    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket ${socket.id} connected`)

      socket.on('register', (clientId: string) => {
        console.log(`Registered client ${clientId} with socket ${socket.id}`)
        this.clientMap.set(clientId, socket)
      })

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`)
        this.clientMap.forEach((value: Socket, key: string) => {
          if (value === socket) {
            console.log(`Removing client ${key}`)
            this.clientMap.delete(key)
          }
        })
      })
    })
  }

  getSocketServer(): Server {
    return this.io
  }

  getClientSocket(clientId: string): Socket {
    return this.clientMap.get(clientId)
  }
}
