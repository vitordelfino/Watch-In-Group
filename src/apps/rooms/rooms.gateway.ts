import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { WsEnterOnRoomPayload, WsAddVideoPayload } from './types/room';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private roomService: RoomsService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('enter-on-room')
  handleEnterOnRoom(client: Socket, payload: WsEnterOnRoomPayload): void {
    const room = this.roomService.getRoom(payload.room);
    if (!room) throw new WsException(`Room ${payload.room} not found`);
    console.log(payload);
    this.roomService.addUser(payload.room, {
      id: client.id,
      name: payload.user,
    });
    this.server.socketsJoin(payload.room);
    this.server
      .to(payload.room)
      .emit('user-entered-room', { id: client.id, room: payload.room });
  }

  @SubscribeMessage('left-room')
  handleLeftRoom(client: Socket, payload: string): void {
    this.logger.log(`Client ${client.id} left room ${payload}`);
    this.server
      .to(payload)
      .emit('user-left-room', `User ${client.id} left room`);
    this.server.socketsLeave(payload);
  }

  @SubscribeMessage('add-video')
  handleAddVideo(client: Socket, payload: WsAddVideoPayload): void {
    this.logger.log(`Add video ${payload.video} on room ${payload.room}`);
    this.roomService.addVideo(payload.room, payload.video);
    this.server.to(payload.room).emit('video-added', payload);
  }

  @SubscribeMessage('play-video')
  handlePlayVideo(client: Socket, payload: WsAddVideoPayload): void {
    this.logger.log(`play video ${payload.video} on room ${payload.room}`);
    this.server.to(payload.room).emit('play', payload);
  }

  @SubscribeMessage('pause-video')
  handlePauseVideo(client: Socket, payload: WsAddVideoPayload): void {
    this.logger.log(`pause video ${payload.video} on room ${payload.room}`);
    this.server.to(payload.room).emit('pause', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);
      const { room, user } = this.roomService.removeUser(client.id);

      this.server
        .to(room.id)
        .emit('user-left-room', `User ${user.name} disconnected`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
