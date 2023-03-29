import * as express from "express";
import * as cors from "cors";
import { defaultRouter } from "./routers/default";
import { accountRouter } from "./routers/account";
import { shopRouter } from "./routers/shop";
import { productRouter } from "./routers/product";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(accountRouter);
app.use(shopRouter);
app.use(productRouter);
app.use(defaultRouter);

export default app;
