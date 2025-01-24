import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CreateUserDto, UpdateUserDto } from "./user.dto";

@Controller('v1/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('create')
    async addUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.userService.addUser(createUserDto);
    }
    @Get('all')
    async getAllUsers(): Promise<User[]> {
        return await this.userService.getAllUsers();
    }
    @Delete('delete/:id')
    async deleteUser(@Param('id') id: number): Promise<string> {
        return await this.userService.deleteUser(id);
    }

    @Put('update/:id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto:UpdateUserDto): Promise<string> {
        return await this.userService.updateUserPassword(id, updateUserDto);
    }
}

