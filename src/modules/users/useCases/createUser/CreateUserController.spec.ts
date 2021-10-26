import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';

let connection: Connection;
describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'User name',
      email: 'user@email.com',
      password: 'User password',
    });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user with email exists', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'Another user name',
      email: 'user@email.com',
      password: 'Another user password',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});
