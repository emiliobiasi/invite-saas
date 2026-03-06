const PASSWORD_ALGORITHM = 'argon2id';
const PASSWORD_MEMORY_COST = 19456; // Bun defaults; tuned for speed vs safety
const PASSWORD_TIME_COST = 2;

export async function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, {
    algorithm: PASSWORD_ALGORITHM,
    memoryCost: PASSWORD_MEMORY_COST,
    timeCost: PASSWORD_TIME_COST,
  });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return Bun.password.verify(plain, hash);
}
