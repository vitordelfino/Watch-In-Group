import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './apps/rooms/rooms.module';
import { YoutubeModule } from './apps/youtube/youtube.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RoomsModule,
    YoutubeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
