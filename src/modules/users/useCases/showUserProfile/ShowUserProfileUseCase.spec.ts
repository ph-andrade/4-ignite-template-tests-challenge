import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository,
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to show user profile', async () => {
    const user = {
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    };

    const userCreated = await createUserUseCase.execute(user);

    const userProfile = await showUserProfileUseCase.execute(
      userCreated.id as string,
    );

    expect(userProfile).toEqual(
      expect.objectContaining({ name: user.name, email: user.email }),
    );
  });

  it('should not be able to show a non-existent user', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('Any user id');
    }).rejects.toBeInstanceOf(AppError);
  });
});
