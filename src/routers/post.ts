require('dotenv').config();

import * as express from 'express';
import * as bcryptjs from 'bcryptjs';
import * as jwt from '../middleware/authJwt';
import { Account } from '../models/account';


const saltRounds = 12;

/**
 * Contains all the functionality to store items in the database
 */
export const postRouter = express.Router();

/**
 * Stores an account in the database
 */
postRouter.post('/signup', async (req, res) => {
  const filter = { username: req.body.username };
  Account.findOne(filter).then(async (account) => {
    if (account !== null) {
      res.status(409).send({
        error: 'The account name is already in use',
      });
    }

    let password = req.body.password.toString();
    if (!password || password.length < 8) {
      res.status(400).send({
        error: 'A password of at least 8 characters is required',
      });
    }

    bcryptjs.genSalt(saltRounds, function (err, salt) {
      if (err) {
        res.status(500).send();
      }
      bcryptjs.hash(password, salt, function (err, hash) {
        if (err) {
          res.status(500).send();
        }
        const newAccount = new Account({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          role: req.body.role,
        });
        newAccount.save().then(() => {
          res.status(201).send({
            message: "Account successfully created",
          });
        }).catch((error) => {
          res.status(400).send(error);
        });
      });
    });

  }).catch((err) => {
    console.log(err);
    res.status(500).send();
  });
});


/**
 * Check if a user is registered and returns the token
 */
postRouter.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({
      error: 'An account name and password must be provided',
    });
  }

  const filter = { username: req.body.username.toString() };
  Account.findOne(filter).then(async (account) => {
    if (!account) {
      res.status(404).send({
        error: "No account found",
      });
    } else {
      const passwd = req.body.password.toString();
      let compare = await bcryptjs.compare(passwd, account.password);
      if (!compare) {
        res.status(404).send({
          error: "Incorrect password",
        });
      }

      const accessToken = jwt.generateAccessToken(account.username);
      res.status(201).send({
        id: account._id,
        username: account.username,
        email: account.email,
        role: account.role,
        accessToken: accessToken,
      });
    }
  }).catch(() => {
    res.status(500).send();
  });
});

