import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to deposit', async () => {
    const user = await createUserUseCase.execute({
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    });

    const deposit = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit description',
    };

    const statementCreated = await createStatementUseCase.execute(deposit);

    expect(statementCreated).toHaveProperty('id');
    expect(statementCreated).toEqual(expect.objectContaining(deposit));
  });

  it('should be able to withdraw', async () => {
    const user = await createUserUseCase.execute({
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit description',
    });

    const withdraw = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'Withdraw description',
    };

    const statementCreated = await createStatementUseCase.execute(withdraw);

    expect(statementCreated).toHaveProperty('id');
    expect(statementCreated).toEqual(expect.objectContaining(withdraw));
  });

  it('should not be able to create a statement with a non-existent user', async () => {
    expect(async () => {
      const statement = {
        user_id: 'Any user id',
        type: OperationType.DEPOSIT,
        amount: 20,
        description: 'DEPOSIT description',
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to withdraw with insufficient funds', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'User name',
        email: 'user@ignite.com',
        password: 'password',
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 50,
        description: 'Withdraw description',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
