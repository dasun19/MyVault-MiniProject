// Create a new file: utils/urlUtils.ts

export interface ParsedVerificationUrl {
  isValidUrl: boolean;
  token?: string;
  baseUrl?: string;
  error?: string;
}

/**
 * Parse a verification URL and extract the JWT token
 * Supports both full URLs and direct JWT tokens
 */
export const parseVerificationUrl = (input: string): ParsedVerificationUrl => {
  const trimmedInput = input.trim();
  
  // Check if input is empty
  if (!trimmedInput) {
    return { isValidUrl: false, error: 'Empty input' };
  }

  try {
    // Case 1: Input is a URL with token parameter
    if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
      const url = new URL(trimmedInput);
      const token = url.searchParams.get('token');
      
      if (!token) {
        return { 
          isValidUrl: false, 
          error: 'No token parameter found in URL',
          baseUrl: `${url.protocol}//${url.host}${url.pathname}`
        };
      }

      return {
        isValidUrl: true,
        token: decodeURIComponent(token),
        baseUrl: `${url.protocol}//${url.host}${url.pathname}`
      };
    }
    
    // Case 2: Input might be a direct JWT token
    // JWT tokens have 3 parts separated by dots
    const tokenParts = trimmedInput.split('.');
    if (tokenParts.length === 3) {
      // Basic validation - try to decode the header
      try {
        const header = JSON.parse(atob(tokenParts[0]));
        if (header.alg) {
          return {
            isValidUrl: true,
            token: trimmedInput
          };
        }
      } catch (e) {
        // Not a valid JWT
      }
    }

    return { 
      isValidUrl: false, 
      error: 'Input is neither a valid verification URL nor a JWT token' 
    };

  } catch (error) {
    return { 
      isValidUrl: false, 
      error: `Invalid URL format: ${(error as Error).message}` 
    };
  }
};

/**
 * Generate a verification URL for a given JWT token
 */
export const generateVerificationUrl = (token: string, baseUrl: string = 'https://your-verification-site.com/verify'): string => {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('token', token);
    return url.toString();
  } catch (error) {
    throw new Error(`Failed to generate verification URL: ${(error as Error).message}`);
  }
};

/**
 * Validate if a string looks like a JWT token
 */
export const isJWTToken = (input: string): boolean => {
  const parts = input.trim().split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode header
    const header = JSON.parse(atob(parts[0]));
    return header.alg !== undefined;
  } catch {
    return false;
  }
};