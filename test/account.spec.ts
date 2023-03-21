import * as request from 'supertest';
import '../src/database/mongoose';
import app from '../src/app';
import { Account } from '../src/models/account';
import { expect } from 'chai';


beforeEach(async () => {
  await Account.deleteMany();
});

afterEach(async () => {
  await Account.deleteMany();
});

describe('POST /signup', () => {
  it('creates a new account', async () => {
    await request(app).post('/signup').send({
      username: "john",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);
  });

  it('does NOT create a new account without username', async () => {
    await request(app).post('/signup').send({
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(400);
  });

  it('should NOT create a new account with the same username', async () => {
    await request(app).post('/signup').send({
      username: "Lucas",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "Lucas",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(409);
  });

  it('should NOT create a new account without email', async () => {
    await request(app).post('/signup').send({
      username: "mary",
      role: "regular",
      password: "Johndoejohndoe1",
    }).expect(400);
  });

  it('should NOT create a new account without password of at least 8 characters', async () => {
    await request(app).post('/signup').send({
      username: "hari",
      role: "regular",
      email: "jhondoe@email.com",
      password: "Asd1234",
    }).then((res) => {
      expect(res.status).to.equal(400)
    });

    await request(app).post('/signup').send({
      username: "hari",
      role: "regular",
      email: "jhondoe@email.com",
      password: "Jo1qasaa",
    }).then((res) => {
      expect(res.status).to.equal(201)
    });
  });

  it ("does NOT create an account with a password without uppercase", async() => {
    await request(app).post('/signup').send({
      username: "man",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe1",
    }).expect(400);

    await request(app).post('/signup').send({
      username: "man",
      role: "admin",
      email: "jhondoe@email.com",
      password: "1johndoejohndoE",
    }).expect(201);
  });

  it ("does NOT create an account with a password without lowercase", async() => {
    await request(app).post('/signup').send({
      username: "men",
      role: "admin",
      email: "jhondoe@email.com",
      password: "JOHNDOEJOHNDOE1",
    }).expect(400);

    await request(app).post('/signup').send({
      username: "men",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);
  });

  it ("does NOT create an account with a password without a number", async() => {
    await request(app).post('/signup').send({
      username: "woman",
      role: "admin",
      email: "jhondoe@email.com",
      password: "JOHNDOEJOHNdoe",
    }).expect(400);

    await request(app).post('/signup').send({
      username: "woman",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);
  });

  it('should only admit two roles', async () => {
    await request(app).post('/signup').send({
      username: "jane",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "keith",
      role: "regular",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "dummy",
      role: "dummy",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(400);
  });
});


describe('POST /login', () => {
  it('should NOT login a user without username', async () => {
    await request(app).post('/login').send({
      password: "johndoejohndoe",
    }).expect(400);
  });

  it('should NOT login a user without password', async () => {
    await request(app).post('/login').send({
      username: "garrus",
    }).expect(400);
  });

  it('should NOT login a user that doesnt exist', async () => {
    await request(app).post('/login').send({
      username: "garrus",
      password: "Johndoejohndoe1",
    }).expect(404);
  });

  it('should successfully login a user account', async () => {
    await request(app).post('/signup').send({
      username: "garrus",
      role: "admin",
      email: "jhondoe@email.com",
      password: "Johndoejohndoe1",
    }).expect(201);

    const response = await request(app).post('/login').send({
      username: "garrus",
      password: "Johndoejohndoe1",
    }).expect(201);

    expect(response.body).to.include({
      username: "garrus",
      email: "jhondoe@email.com",
      role: "admin"
    });

    expect(response.body.accessToken).to.exist;
  });
});