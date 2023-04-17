import * as express from "express";
import { accountRouter } from "./routers/account";
import { defaultRouter } from "./routers/default";
import { productRouter } from "./routers/product";
import { receiptRouter } from "./routers/receipt";
import { shopRouter } from "./routers/shop";

const app = express();

app.use(express.json());
app.use(accountRouter);
app.use(shopRouter);
app.use(productRouter);
app.use(receiptRouter);
app.use(defaultRouter);

export default app;
