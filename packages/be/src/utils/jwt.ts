import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { env } from '@config/env';

const encoder = new TextEncoder();
const secretKey = encoder.encode(env.JWT_SECRET);

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  email?: string;
};

export async function signJwt(payload: AuthTokenPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    return payload as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}
