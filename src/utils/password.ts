import crypto from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SPECIAL_CHARS = /^[!@#$%^&*()_+\-=\[\]{}:;,.<>?]$/;

export function validateLogin(login: string): boolean {
  return /^[a-z]{4,}$/.test(login);
}

export function validatePassword(password: string): { ok: boolean; message?: string } {
  if (password.length < 8 || password.length > 128) {
    return { ok: false, message: 'A senha deve ter entre 8 e 128 caracteres.' };
  }
  if (/[\u0000-\u001f\u007f\s]/.test(password)) {
    return { ok: false, message: 'A senha não deve conter espaços ou caracteres de controle.' };
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { ok: false, message: 'A senha deve conter letras e números.' };
  }
  if (!password.split('').some((char) => SPECIAL_CHARS.test(char))) {
    return { ok: false, message: 'A senha deve conter ao menos um caractere especial seguro.' };
  }
  return { ok: true };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  const salt = Buffer.from(saltRaw, 'base64');
  const expected = Buffer.from(hashRaw, 'base64');
  if (salt.length === 0 || expected.length === 0) return false;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, { N: n, r, p }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return crypto.timingSafeEqual(derived, expected);
}
