import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserData, GroupsService } from './groups.service';

interface GenerateGroupDto {
  owner: string;
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async generateGroup(@Body() body: GenerateGroupDto) {
    return this.groupsService.generateGroup(body.owner);
  }

  @Get()
  async getAllGroups() {
    return this.groupsService.getAllGroups();
  }

  @Post('add')
  async addGroup(@Body() body: AddUserData) {
    return this.groupsService.addUser(body);
  }
}
