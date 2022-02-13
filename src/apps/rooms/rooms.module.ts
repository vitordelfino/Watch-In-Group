import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { YoutubeModule } from '../youtube/youtube.module';

@Module({
  imports: [ScheduleModule.forRoot(), YoutubeModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
