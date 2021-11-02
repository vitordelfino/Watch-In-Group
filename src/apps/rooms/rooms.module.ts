import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
