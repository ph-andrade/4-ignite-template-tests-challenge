import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to show the user account balance', async () => {
    const user = await createUserUseCase.execute({
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      sender_id: null,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit description',
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      sender_id: null,
      type: OperationType.WITHDRAW,
      amount: 30,
      description: 'Withdraw description',
    });

    const userBalance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(userBalance.balance).toEqual(70);
    expect(userBalance.statement).toEqual(
      expect.arrayContaining([deposit, withdraw]),
    );
  });

  it('should not be able to show the user account balance with a non-existent user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'Any user id',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
