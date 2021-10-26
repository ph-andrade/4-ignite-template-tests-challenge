import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'User name',
      email: 'user@email.com',
      password: 'User password',
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: 'User password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate a non-existent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'another.user@email.com',
      password: 'User password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });

  it('should not be able to authenticate an user with incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@email.com',
      password: 'Another user password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });
});
