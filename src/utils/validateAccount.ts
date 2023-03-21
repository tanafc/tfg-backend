/**
 * Returns true if the password is at least 8 characters,
 * with one uppercase and one lowecase.
 * @param password 
 * @returns 
 */
export function isSecure(password: string): boolean {
  const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regexp.test(password);
}

/**
 * Returns true if the email address is valid by W3C HTML5
 * specifications: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 * @param email 
 * @returns 
 */
export function isValidEmail(email: string): boolean {
  const regexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regexp.test(email);
}

/**
 * Returns true if the username is valid, between 4 to 20 characters.
 * @param username 
 * @returns 
 */
export function isValidUsername(username: string): boolean {
  const regexp = /^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  return regexp.test(username);
}
