import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to show the specified statement operation', async () => {
    const user = await createUserUseCase.execute({
      name: 'User name',
      email: 'user@ignite.com',
      password: 'password',
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit description',
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: deposit.id as string,
    });

    expect(statementOperation).toEqual(expect.objectContaining(deposit));
  });

  it('should not be able to show a statement operation with a non-existent user', async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'User name',
        email: 'user@ignite.com',
        password: 'password',
      });

      const deposit = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit description',
      });

      await getStatementOperationUseCase.execute({
        user_id: 'Another user id',
        statement_id: deposit.id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to show a non-existent statement operation', async () => {
    expect(async () => {
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

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'Another statement id',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
