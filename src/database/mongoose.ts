import * as dotenv from "dotenv";
import * as mongoose from "mongoose";

dotenv.config();

const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env;

let connectionUrl = "";

if (NODE_ENV === "test") {
  connectionUrl = MONGO_DB_URI_TEST as string;
} else {
  connectionUrl = MONGO_DB_URI as string;
}

mongoose.set("strictQuery", true);

mongoose
  .connect(connectionUrl, {
    autoIndex: true,
  })
  .then(() => {
    console.log("Connection to MongoDB server established");
  })
  .catch((err) => {
    console.log("Unnable to connect to MongoDB server");
    console.log(err);
  });

const db = mongoose.connection;

export default db;
