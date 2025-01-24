import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    role: 'user',
  };
  const mockUsers: User[] = [
    mockUser,
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'hashedPassword',
      role: 'admin',
    },
  ];

  const mockUserService = {
    addUser: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
    updateUserPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addUser', () => {
    it('should add a new user and return it', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: 'admin',
      };
      mockUserService.addUser.mockResolvedValue({ ...mockUser, ...createUserDto });

      const result = await controller.addUser(createUserDto);
      expect(result).toEqual({ ...mockUser, ...createUserDto });
      expect(service.addUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(service.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return a success message', async () => {
      const id = 1;
      mockUserService.deleteUser.mockResolvedValue(`User with id ${id} deleted successfully`);

      const result = await controller.deleteUser(id);
      expect(result).toBe(`User with id ${id} deleted successfully`);
      expect(service.deleteUser).toHaveBeenCalledWith(id);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return a success message', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      mockUserService.updateUserPassword.mockResolvedValue(`User with id ${id} updated successfully`);

      const result = await controller.updateUser(id, updateUserDto);
      expect(result).toBe(`User with id ${id} updated successfully`);
      expect(service.updateUserPassword).toHaveBeenCalledWith(id, updateUserDto);
    });
  });
});
