import { AccountInterface } from "../../src/models/account";

declare global {
  namespace Express {
    export interface Request {
      user: AccountInterface;
    }
  }
}
