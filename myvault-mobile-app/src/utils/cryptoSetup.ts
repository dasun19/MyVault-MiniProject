import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

// Enhanced hash generation with SHA-256
export const generateSecureHash = (data: string, salt: string = ''): string => {
    const timestamp: string = new Date().getTime().toString();
    const combinedData: string = `${data}${salt}${timestamp}`;
    
    try {
        const hash = CryptoJS.SHA256(combinedData).toString();
        console.log('Generated hash:', hash); // Added for debugging
        return hash;
    } catch (error) {
        console.error('Hash generation error:', error);
        throw error;
    }
};

// Create a unique id for each card
export const generateUniqueId = (): string => {
    try {
        const id = CryptoJS.lib.WordArray.random(16).toString();
        console.log('Generated unique ID:', id); // Added for debugging
        return id;
    } catch (error) {
        console.error('Unique ID generation error:', error);
        throw error;
    }
};

// Encrypt sensitive data
export const encryptData = (data: any, key: string): string => {
    try {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
        console.log('Data encrypted successfully'); // Added for debugging
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
};

// Decrypt sensitive data
export const decryptData = (encryptedData: string, key: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        console.log('Data decrypted successfully'); // Added for debugging
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

export default CryptoJS;