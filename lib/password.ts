import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hash - The hash to verify against
 * @returns True if the password matches the hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
