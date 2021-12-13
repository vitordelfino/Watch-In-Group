import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'GROUPS_PACKAGE',
        useFactory: () => ({
          transport: Transport.GRPC,
          options: {
            url: 'localhost:50052',
            package: 'group',
            protoPath: join(__dirname, './proto/groups.proto'),
          },
        }),
      },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
