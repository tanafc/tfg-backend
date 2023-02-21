import * as request from 'supertest';
import '../src/database/mongoose';
import app from '../src/app';
import { Account } from '../src/models/account';
import { expect } from 'chai';


beforeEach(async () => {
  await Account.deleteMany();
});

describe('POST /signup', () => {
  it('Should successfully create a new account', async () => {
    await request(app).post('/signup').send({
      username: "john",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe",
    }).expect(201);
  });

  it('Should not create a new account without username', async () => {
    await request(app).post('/signup').send({
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe",
    }).expect(400);
  });

  it('Should not create a new account with the same username', async () => {
    await request(app).post('/signup').send({
      username: "Lucas",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "Lucas",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe",
    }).expect(409);
  });

  it('Should not create a new account without email', async () => {
    await request(app).post('/signup').send({
      username: "john",
      role: "admin",
      password: "johndoejohndoe",
    }).expect(400);
  });

  it('Should not create a new account without a proper password', async () => {
    await request(app).post('/signup').send({
      username: "john",
      role: "admin",
      email: "jhondoe@email.com",
      password: "john",
    }).expect(400);
  });

  it('Should only admit two roles', async () => {
    await request(app).post('/signup').send({
      username: "jane",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejane",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "keith",
      role: "regular",
      email: "jhondoe@email.com",
      password: "johndoekeith",
    }).expect(201);

    await request(app).post('/signup').send({
      username: "dummy",
      role: "dummy",
      email: "jhondoe@email.com",
      password: "john",
    }).expect(400);
  });
});


describe('POST /login', () => {
  it('Shouldnt login a user without username', async () => {
    await request(app).post('/login').send({
      password: "johndoejohndoe",
    }).expect(400);
  });

  it('Shouldnt login a user without password', async () => {
    await request(app).post('/login').send({
      username: "garrus",
    }).expect(400);
  });

  it('Shouldnt login a user that doesnt exist', async () => {
    await request(app).post('/login').send({
      username: "garrus",
      password: "johndoejohndoe",
    }).expect(404);
  });

  it('Should successfully login a user account', async () => {
    await request(app).post('/signup').send({
      username: "garrus",
      role: "admin",
      email: "jhondoe@email.com",
      password: "johndoejohndoe",
    }).expect(201);

    const response = await request(app).post('/login').send({
      username: "garrus",
      password: "johndoejohndoe",
    }).expect(201);

    expect(response.body).to.include({
      username: "garrus",
      email: "jhondoe@email.com",
      role: "admin"
    });

    expect(response.body.accessToken).to.exist;
  });
});