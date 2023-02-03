require('dotenv').config();
import * as mongoose from 'mongoose';


const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

/**
 * If the enviroment variable is not established connects to the url
 */
let connectionUrl = ""

if (NODE_ENV === 'test') {
  connectionUrl = MONGO_DB_URI_TEST as string;
} else {
  connectionUrl = MONGO_DB_URI as string;
}

mongoose.set('strictQuery', true);

/**
 * Connects to the Mongo server
 */
mongoose.connect(connectionUrl as string, {
  autoIndex: true,
}).then(() => {
  console.log('Connection to MongoDB server established');
}).catch((err) => {
  console.log('Unnable to connect to MongoDB server');
  console.log(err);
});

const db = mongoose.connection;

// Exports the connection with the database
export default db;