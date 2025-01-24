import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async addUser(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await this.hashPassword(createUserDto.password);
        const userToSave = {
            ...createUserDto,
            password: hashedPassword,
        };

        return await this.userRepository.save(userToSave);
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }
    async deleteUser(id: number): Promise<string> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        return 'User deleted successfully.';

    }

    async updateUserPassword(id: number, updateUserDto: UpdateUserDto): Promise<string> {
        const { oldPassword, newPassword } = updateUserDto;
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Old password is incorrect.');
        }
        const hashedNewPassword = await this.hashPassword(newPassword);
        user.password = hashedNewPassword;
        await this.userRepository.save(user);
        return 'Password updated successfully.';
    }
}
