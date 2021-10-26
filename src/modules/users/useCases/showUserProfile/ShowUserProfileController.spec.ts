import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
let token: string;

describe('Show User Profile Controller', () => {
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

  it('should be able to show a user profile', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'User name',
        email: 'user@email.com',
      }),
    );
  });

  it('should not be able to show a non-existent user', async () => {
    await connection.query('DELETE FROM users');

    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
