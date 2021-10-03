import { compare } from 'bcryptjs';

import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = {
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty('id');

    expect(userCreated).toEqual(
      expect.objectContaining({ name: user.name, email: user.email }),
    );

    expect(await compare(user.password, userCreated.password)).toBeTruthy();
  });

  it('should not be able to create a new user with email exists', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'User name',
        email: 'user@ignite.com',
        password: 'password',
      });

      await createUserUseCase.execute({
        name: 'Another user name',
        email: 'user@ignite.com',
        password: 'another password',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
