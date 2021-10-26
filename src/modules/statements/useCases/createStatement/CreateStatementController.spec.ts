import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
let token: string;

describe('Create Statement Controller', () => {
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

  it('should be able to deposit', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        amount: 100,
        description: 'Deposit description',
      }),
    );
  });

  it('should be able to withdraw', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        amount: 50,
        description: 'Withdraw description',
      }),
    );
  });

  it('should not be able to withdraw with insufficient funds', async () => {
    await connection.query('DELETE FROM statements');

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 150,
        description: 'Withdraw description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient funds');
  });

  it('should not be able to create a statement with a non-existent user', async () => {
    await connection.query('DELETE FROM users');

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit description',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
