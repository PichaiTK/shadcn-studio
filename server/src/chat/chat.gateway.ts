import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage("chat:send")
  handleMessage(client: Socket, payload: any) {
    this.server.emit("chat:message", {
      user: payload.user,
      message: payload.message,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage("chat:join")
  handleJoinRoom(client: Socket, room: string) {
    client.join(room)
    this.server.to(room).emit("chat:user-joined", { clientId: client.id })
  }
}
