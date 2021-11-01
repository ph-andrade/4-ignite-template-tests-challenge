import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { receiver_id } = request.params;
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/');
    const type =
      splittedPath[splittedPath.length - 2] === 'transfer'
        ? OperationType.TRANSFER
        : (splittedPath[splittedPath.length - 1] as OperationType);

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: receiver_id || id,
      sender_id: receiver_id ? id : null,
      type,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}
