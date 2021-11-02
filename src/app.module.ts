import { Module } from '@nestjs/common';
import { RoomsModule } from './apps/rooms/rooms.module';

@Module({
  imports: [RoomsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
