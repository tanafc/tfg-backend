import * as bcryptjs from "bcryptjs";

const saltRounds = 10;

export function hashPassword(password: string): string {
  return bcryptjs.hashSync(password, saltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
    return bcryptjs.compareSync(password, hash);
}