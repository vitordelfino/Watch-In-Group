import { GenerateRoomDto } from './apps/rooms/dto/GenerateRoomDto';
import { plainToClass } from 'class-transformer';
import { RoomsService } from './apps/rooms/rooms.service';

const roomService = new RoomsService();

const room = roomService.generateRoom(
  plainToClass(GenerateRoomDto, {
    owner: 'Vitor Delfino',
  }),
);

console.log(room);

roomService.addUser(room.id, { id: 'xpto', name: 'Vitor Delfino' });

console.log(roomService.getRooms());

console.log('removeUserXpto', roomService.removeUser('xpto'));
console.log('remove other user', roomService.removeUser('abcde'));
