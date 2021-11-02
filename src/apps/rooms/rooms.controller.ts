import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenerateRoomDto } from './dto/GenerateRoomDto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(@Body() generateRoomDto: GenerateRoomDto) {
    return this.roomsService.generateRoom(generateRoomDto);
  }

  @Get()
  async getRooms() {
    return this.roomsService.getRooms();
  }

  @Get('/:id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }
}
