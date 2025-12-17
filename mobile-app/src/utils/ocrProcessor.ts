import TextRecognition from 'react-native-text-recognition';

// Types
export interface ExtractedData {
    idNumber?: string;
    dateOfBirth?: string;
    name?: string;
    address?: string;
    phone?: string;
    extractedText?: string;
}

export interface OCRResult {
    success: boolean;
    text: string[] | string;
    confidence?: number;
    error?: string;
}

// Updated patterns for Sri Lankan IDs
const PATTERNS = {
    // Sri Lanka NIC patterns
    nicNumber: /\b(\d{9}[VX]|\d{12})\b/gi,
    
    // Date patterns
    dateOfBirth: /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4})\b/g,
    
    // Name patterns - more flexible for case
    name: /\b[A-Za-z]+(?:\s+[A-Za-z]+)*\b/g, // Updated for mixed case
    
    // Address patterns
    address: /\d+[A-Za-z\s,.-]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Mawatha|Gama)/gi,
    
    // Phone patterns for Sri Lanka
    phone: /\b(?:\+94|0)?[1-9]\d{8}\b/g,
};

// Helper functions
const cleanText = (text: string): string => {
    const cleaned = text
        .replace(/[^\w\s\-./]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    console.log('Cleaned text:', cleaned); // Added for debugging
    return cleaned;
};

const formatDate = (dateString: string): string => {
    try {
        let date: Date;
        
        if (dateString.includes('-')) {
            date = new Date(dateString);
        } else if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts[2] && parts[2].length === 4) {
                // MM/DD/YYYY or DD/MM/YYYY
                date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else if (parts[2]) {
                // MM/DD/YY or DD/MM/YY
                const year = parseInt(parts[2]) < 50 ? `20${parts[2]}` : `19${parts[2]}`;
                date = new Date(`${year}-${parts[1]}-${parts[0]}`);
            } else {
                date = new Date(dateString);
            }
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString); // Added for debugging
            return dateString;
        }
        
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString; // Fallback
    }
};

// Main extractor function
export const extractInformationFromText = (
    ocrText: string,
    side: 'front' | 'back' = 'front'
): ExtractedData => {
    const cleanedText = cleanText(ocrText);
    if (!cleanedText) {
        console.warn('No cleaned text for extraction'); // Added for debugging
    }
    console.log('Processing OCR Text:', cleanedText);

    const extractedData: ExtractedData = {
        extractedText: cleanedText
    };

    if (side === 'front') {
        // Extract NIC Number
        const nicMatches = cleanedText.match(PATTERNS.nicNumber);
        if (nicMatches && nicMatches.length > 0) {
            extractedData.idNumber = nicMatches[0].toUpperCase();
            console.log('Extracted NIC:', extractedData.idNumber); // Added for debugging
        }

        // Extract Name
        const nameMatches = cleanedText.match(PATTERNS.name);
        if (nameMatches && nameMatches.length > 0) {
            const longestName = nameMatches.reduce((a, b) => a.length > b.length ? a : b);
            console.log('Selected name:', longestName); // Added for debugging
            extractedData.name = longestName;
        }
        
        // Extract Date of Birth
        const dateMatches = cleanedText.match(PATTERNS.dateOfBirth);
        if (dateMatches && dateMatches.length > 0) {
            extractedData.dateOfBirth = formatDate(dateMatches[0]);
            console.log('Extracted DOB:', extractedData.dateOfBirth); // Added for debugging
        }
    } else {
        // Back side processing
        const lines = cleanedText
            .split('\n')
            .filter(line => line.trim().length > 5);
        
        if (lines.length > 0) {
            extractedData.address = lines.slice(0, 3).join(', ');
            console.log('Extracted address:', extractedData.address); // Added for debugging
        }

        // Extract Phone
        const phoneMatches = cleanedText.match(PATTERNS.phone);
        if (phoneMatches && phoneMatches.length > 0) {
            extractedData.phone = phoneMatches[0];
            console.log('Extracted phone:', extractedData.phone); // Added for debugging
        }
    }

    return extractedData;
};

// OCR processing function
export const processImageWithOCR = async (
    imageUri: string
): Promise<OCRResult> => {
    try {
        console.log('Starting OCR processing for:', imageUri);

        const result = await TextRecognition.recognize(imageUri);
        console.log('Raw OCR Result:', result);

        if (!result || (Array.isArray(result) && result.length === 0)) {
            throw new Error('No text recognized in image');
        }

        // Handle different result formats
        let textArray: string[];
        if (Array.isArray(result)) {
            textArray = result;
        } else if (typeof result === 'string') {
            textArray = [result];
        } else {
            textArray = [];
        }

        return {
            success: true,
            text: textArray,
            confidence: 0.8, // Consider extracting actual confidence if supported
        };
    } catch (error: any) {
        console.error('OCR Error:', error);
        return {
            success: false,
            error: error.message,
            text: [],
        };
    }
};

// Manual extraction helpers
export const manualExtraction = {
    extractNIC: (text: string): string | null => {
        const matches = text.match(PATTERNS.nicNumber);
        return matches ? matches[0].toUpperCase() : null;
    },

    extractName: (text: string): string | null => {
        const namePattern = /(?:Name[:\s]+)?([A-Za-z]+(?:\s+[A-Za-z]+)*)/gi; // Updated for case
        const matches = text.match(namePattern);
        if (matches && matches.length > 0) {
            return matches[0].replace(/Name[:\s]+/gi, '').trim();
        }
        return null;
    },

    extractDate: (text: string): string | null => {
        const matches = text.match(PATTERNS.dateOfBirth);
        return matches ? formatDate(matches[0]) : null;
    },
};

// Default export
export default {
    extractInformationFromText,
    processImageWithOCR,
    manualExtraction,
};