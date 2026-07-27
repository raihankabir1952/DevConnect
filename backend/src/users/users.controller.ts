import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // SEARCH USERS BY NAME
  // GET /users/search?name=Raihan
  // ==========================================

  @Get('search')
  searchUsers(
    @Query('name') name: string,
  ) {
    return this.usersService.searchUsers(
      name,
    );
  }

  // ==========================================
  // GET USER PROFILE BY ID
  // GET /users/:id
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }
}