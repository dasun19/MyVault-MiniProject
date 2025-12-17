// src/utils/jwtUtils.ts
import { sign, decode } from 'react-native-pure-jwt';

// Define the expected payload shape
interface JwtPayload {
  data?: any;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number | string;
  [key: string]: any;
}

const JWT_SECRET = 'your-super-secret-key-change-this-in-production';
const APP_ISSUER = 'myvault-app';
const APP_AUDIENCE = 'myvault-verifier';

/**
 * Create a JWT securely with optional expiration
 */
export const createSecureToken = async (
  data: any,
  expirationOption: string      // Here previously  - expirationOption: string = 'No Expiration' (Error, could not slove by every AI)
): Promise<string> => {
  try {

    // Use milliseconds for iat and exp as required by react-native-pure-jwt
    const now = Date.now(); // milliseconds
    let exp: number | undefined;

    if (expirationOption === '1 Hour') exp = now + 3600 * 1000;
    else if (expirationOption === '1 Day') exp = now + 86400 * 1000;
    else if (expirationOption === '1 Week') exp = now + 604800 * 1000;
   

    // Always log the values for debugging
    console.log('JWT iat (now, ms):', now, 'exp (ms):', exp);

    const payload: any = {
      data,
      iss: APP_ISSUER,
      aud: APP_AUDIENCE,
      iat: now,
      ...(typeof exp === 'number' ? { exp } : {}), // only add exp if defined
    };

    const token = await sign(payload, JWT_SECRET, {
      alg: 'HS256',
    });

    console.log(
      'JWT Created:',
      token.substring(0, 40) + '...',
      exp ? 'Expires at: ' + new Date(exp * 1000).toISOString() : 'No Expiration'
    );

    return token;
  } catch (error: any) {
    console.error('JWT Creation Error:', error.message, error.stack);
    throw new Error('Failed to create JWT: ' + error.message);
  }
};

/**
 * Verify a JWT with signature, issuer, audience and expiration checks
 */
export const verifySecureToken = async (
  token: string
): Promise<{ isValid: boolean; data?: any; error?: string }> => {
  try {
    // react-native-pure-jwt decode returns payload fields as string or number
    const decoded = await decode(token, JWT_SECRET, {});
    const payload = decoded.payload as JwtPayload;

    // Log decoded payload for debugging
    console.log('Decoded JWT payload:', payload);

    if (payload.iss !== APP_ISSUER) {
      return { isValid: false, error: 'Invalid issuer' };
    }
    if (payload.aud !== APP_AUDIENCE) {
      return { isValid: false, error: 'Invalid audience' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    let expNum: number | undefined;
    if (typeof payload.exp === 'string') {
      expNum = parseInt(payload.exp, 10);
    } else if (typeof payload.exp === 'number') {
      expNum = payload.exp;
    }
    if (typeof expNum === 'number') {
      console.log('JWT exp:', expNum, 'now:', nowSec);
      if (expNum < nowSec) {
        return { isValid: false, error: 'Token has expired' };
      }
    }
    if (!payload.data) {
      return { isValid: false, error: 'No data found in token' };
    }

    return { isValid: true, data: payload.data };
  } catch (error: any) {
    console.error('JWT Verify Error:', error.message, error.stack);
    return { isValid: false, error: 'Invalid token' };
  }
};

/**
 * Decode a JWT without verifying signature (for inspection only)
 */
export const getTokenInfo = async (
  token: string
): Promise<{
  isValid: boolean;
  issuedAt?: Date;
  expiresAt?: Date;
  data?: any;
  error?: string;
}> => {
  try {
    // Use skipValidation: true to just decode
    const decoded = await decode(token, JWT_SECRET, { skipValidation: true });
    const payload = decoded.payload as JwtPayload;
    const toDate = (sec?: number | string) => {
      if (typeof sec === 'string') {
        const n = parseInt(sec, 10);
        return isNaN(n) ? undefined : new Date(n * 1000);
      }
      if (typeof sec === 'number') {
        return new Date(sec * 1000);
      }
      return undefined;
    };

    // Log for debugging
    console.log('Decoded JWT (no verify):', payload);

    return {
      isValid: true,
      issuedAt: toDate(payload.iat),
      expiresAt: toDate(payload.exp),
      data: payload.data || null,
    };
  } catch (error: any) {
    console.error('JWT Decode Error:', error.message, error.stack);
    return { isValid: false, error: 'Invalid token' };
  }
};
