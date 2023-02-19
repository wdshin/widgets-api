import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { SocketService } from './common/socket.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const socketService = app.get(SocketService)

  const server = app.getHttpServer()
  socketService.createSocketServer(server)

  await app.listen(5000)
}
bootstrap()
