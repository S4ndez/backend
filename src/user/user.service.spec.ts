import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcryptjs';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    role: 'user',
  };

  const mockUserRepository = {
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addUser', () => {
    it('should hash the password and save the user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: 'admin',
      };
      const hashedPassword = 'hashedPassword123';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...createUserDto, password: hashedPassword });

      const result = await service.addUser(createUserDto);
      expect(result).toEqual({ ...mockUser, ...createUserDto, password: hashedPassword });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...createUserDto, password: hashedPassword });
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.getAllUsers();
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return a success message', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUser(1);
      expect(result).toBe('User deleted successfully.');
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if no user is deleted', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserPassword', () => {
    it('should update the user password if old password is correct', async () => {
      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const hashedNewPassword = 'hashedNewPassword123';

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedNewPassword);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.updateUserPassword(1, updateUserDto);
      expect(result).toBe('Password updated successfully.');
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, password: hashedNewPassword });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserPassword(1, {
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if old password is incorrect', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.updateUserPassword(1, {
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
