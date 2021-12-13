import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface Owner {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface GenerateGroupData {
  owner: string;
}

interface GetGroupData {
  id: string;
}

export interface AddUserData {
  user: User;
  groupId: string;
}

interface RemoveUserData {
  userId: string;
}

interface AddVideoData {
  video: string;
  groupId: string;
}

export interface GenerateGroupResponse {
  id: string;
  owner: Owner;
  lastJoinedAt: Date;
  users: Map<string, User>;
  videos: Map<string, string>;
}

export interface GetAllGroupsResponse {
  groups: GenerateGroupResponse[];
}

interface GroupsGrpcService {
  generateGroup(data: GenerateGroupData): Observable<GenerateGroupResponse>;
  getGroup(data: GetGroupData): Observable<GenerateGroupResponse>;
  getAllGroups(data: any): Observable<GetAllGroupsResponse>;
  addUser(data: AddUserData): Observable<void>;
  removeUser(data: RemoveUserData): Observable<void>;
  addVideo(data: AddVideoData): Observable<void>;
}

@Injectable()
export class GroupsService implements OnModuleInit {
  private groupsGrpcService: GroupsGrpcService;

  constructor(@Inject('GROUPS_PACKAGE') private clientGrpc: ClientGrpc) {}

  onModuleInit() {
    this.groupsGrpcService =
      this.clientGrpc.getService<GroupsGrpcService>('GroupService');
  }

  async generateGroup(owner: string): Promise<GenerateGroupResponse> {
    try {
      const group$ = this.groupsGrpcService.generateGroup({ owner });
      const response = await lastValueFrom(group$);
      console.log('response', response);
      return response;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllGroups(): Promise<GetAllGroupsResponse> {
    try {
      const groups$ = this.groupsGrpcService.getAllGroups({});
      const response = await lastValueFrom(groups$);
      console.log('response', response);
      return response;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addUser({ groupId, user }: AddUserData): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.groupsGrpcService.addUser({
          user,
          groupId,
        }),
      );
      console.log('response', response);
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
