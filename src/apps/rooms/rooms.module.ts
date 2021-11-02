import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
