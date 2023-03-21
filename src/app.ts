import * as express from "express";
import * as cors from "cors";
import { defaultRouter } from "./routers/default";
import { postRouter } from "./routers/post";
import { getRouter } from "./routers/get";
import {patchRouter} from './routers/patch';
import {deleteRouter} from './routers/delete';

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(postRouter);
app.use(getRouter);
app.use(patchRouter);
app.use(deleteRouter);
app.use(defaultRouter);

export default app;
