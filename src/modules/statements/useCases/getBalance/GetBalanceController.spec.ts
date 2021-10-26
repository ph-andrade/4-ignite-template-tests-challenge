import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
let token: string;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'User name',
      email: 'user@email.com',
      password: 'User password',
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: 'User password',
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show the user account balance', async () => {
    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const withdraw = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 30,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const userBalance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(userBalance.status).toBe(200);
    expect(userBalance.body.balance).toEqual(70);
    expect(userBalance.body.statement).toEqual(
      expect.arrayContaining([...deposit.body, ...withdraw.body]),
    );
  });

  it('should not be able to show the user account balance with a non-existent user', async () => {
    await connection.query('DELETE FROM users');

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
