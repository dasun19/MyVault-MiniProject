import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

/**
 * Generate a deterministic SHA-256 hash for identity/data.
 * Same input always produces the same hash.
 * @param data - The string data to hash
 * @param salt - Optional secret salt to increase security
 * @returns Hex string of hash
 */
export const generateSecureHash = (data: string, salt: string = ''): string => {
    const combinedData: string = `${data}${salt}`;
    try {
        const hash = CryptoJS.SHA256(combinedData).toString();
        // console.log('Generated hash:', hash); // optional debug
        return hash;
    } catch (error) {
        console.error('Hash generation error:', error);
        throw error;
    }
};

/**
 * Generate a unique ID
 * Useful for record identifiers
 * @returns Random unique ID string
 */
export const generateUniqueId = (): string => {
    try {
        const id = CryptoJS.lib.WordArray.random(16).toString();
        // console.log('Generated unique ID:', id); // optional debug
        return id;
    } catch (error) {
        console.error('Unique ID generation error:', error);
        throw error;
    }
};

/**
 * Encrypt sensitive data using AES
 * @param data - Object or string to encrypt
 * @param key - Secret key
 * @returns Encrypted string
 */
export const encryptData = (data: any, key: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
        // console.log('Data encrypted successfully'); // optional debug
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
};

/**
 * Decrypt AES-encrypted data
 * @param encryptedData - Encrypted string
 * @param key - Secret key
 * @returns Decrypted object or null on failure
 */
export const decryptData = (encryptedData: string, key: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // console.log('Data decrypted successfully'); // optional debug
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

export default CryptoJS;
