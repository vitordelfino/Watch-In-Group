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
  async handleAddVideo(
    client: Socket,
    payload: WsAddVideoPayload,
  ): Promise<void> {
    this.logger.log(`Add video ${payload.video} on room ${payload.room}`);
    await this.roomService.addVideo(payload.room, payload.video);
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

  @SubscribeMessage('remove-video')
  handleRemoveVideo(client: Socket, payload: WsAddVideoPayload): void {
    this.logger.log(`Remove video ${payload.video} on room ${payload.room}`);
    this.roomService.removeVideo(payload.room, payload.video);
    this.server.to(payload.room).emit('video-removed', payload);
  }

  @SubscribeMessage('change-current-video')
  handleChangeCurrentTime(client: Socket, payload: WsAddVideoPayload): void {
    this.logger.log(
      `Change current video ${payload.video} on room ${payload.room}`,
    );
    this.roomService.changeCurrentVideo(payload.room, payload.video);
    this.server.to(payload.room).emit('current-video-changed', payload);
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
