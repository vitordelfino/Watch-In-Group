import { GenerateRoomDto } from './dto/GenerateRoomDto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Room, User } from './types/room';
import { classToPlain } from 'class-transformer';

@Injectable()
export class RoomsService {
  private rooms = new Map<string, Room>();

  public generateRoom(generateRoomDto: GenerateRoomDto): Room {
    const id = Math.random().toString(36).substr(2, 9);
    const plain = classToPlain(generateRoomDto);
    const room: Room = {
      id,
      owner: {
        name: generateRoomDto.owner,
        ownerSlug: plain.slug,
      },
      users: new Map(),
      videos: new Map(),
    };
    this.rooms.set(id, room);
    return room;
  }

  public getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public getRoom(id: string): Room {
    const room = this.rooms.get(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    return room;
  }

  public addUser(id: string, user: User): void {
    const room = this.rooms.get(id);
    room.users.set(user.id, user);
  }

  public removeUser(id: string): { room: Room; user: User } {
    for (const room of this.rooms.values()) {
      if (room.users.has(id)) {
        const user = room.users.get(id);
        room.users.delete(id);
        return { room, user };
      }
    }
    throw new Error('Nothin to remove');
  }

  public addVideo(roomId: string, url: string): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException(`Room with id ${roomId} not found`);
    }
    room.videos.set(url, url);
  }
}
