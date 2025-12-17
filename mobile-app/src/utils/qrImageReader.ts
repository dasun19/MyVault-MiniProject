
// src/utils/qrImageReader.ts
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import jsQR from 'jsqr';
import { Image } from 'react-native';

export interface QRReadResult {
  success: boolean;
  data?: string;
  error?: string;
}

export const selectImageFromGallery = (): Promise<{ uri: string; base64: string } | null> => {
  return new Promise((resolve) => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: true, // Enable base64 output
      quality: 1.0,
    };
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('Image Picker: User cancelled');
        resolve(null);
        return;
      }
      if (response.errorMessage) {
        console.log('Image Picker Error:', response.errorMessage);
        resolve(null);
        return;
      }
      if (response.assets && response.assets[0]?.uri && response.assets[0]?.base64) {
        console.log('Selected Image URI:', response.assets[0].uri);
        resolve({ uri: response.assets[0].uri, base64: response.assets[0].base64 });
      } else {
        console.log('Image Picker: No image selected');
        resolve(null);
      }
    });
  });
};

export const readQRCodeFromImage = async (image: { uri: string; base64: string }): Promise<QRReadResult> => {
  try {
    console.log('Reading QR from image:', image.uri);
    let base64 = image.base64;

    // Remove data URI prefix if present (e.g., 'data:image/png;base64,')
    if (base64.includes('base64,')) {
      base64 = base64.split('base64,')[1];
      console.log('Removed base64 prefix, new length:', base64.length);
    } else {
      console.log('No base64 prefix found, length:', base64.length);
    }

    // Validate base64 string
    if (!base64 || base64.length < 100) {
      console.error('Invalid base64 data: too short or empty');
      return { success: false, error: 'Invalid base64 data: too short or empty' };
    }

    // Decode base64 to binary
    let binaryString: string;
    try {
      binaryString = atob(base64);
    } catch (e) {
      console.error('Base64 decode error:', e);
      return { success: false, error: `Failed to decode base64: ${e.message}` };
    }
    const length = binaryString.length;
    const bytes = new Uint8ClampedArray(length * 4); // Assume RGBA (4 bytes per pixel)
    for (let i = 0; i < length; i++) {
      // Simplified: assume grayscale or single-channel data; jsQR expects RGBA
      const value = binaryString.charCodeAt(i);
      bytes[i * 4] = value; // R
      bytes[i * 4 + 1] = value; // G
      bytes[i * 4 + 2] = value; // B
      bytes[i * 4 + 3] = 255; // A (opaque)
    }

    // Get image dimensions
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      Image.getSize(
        image.uri,
        (w, h) => {
          console.log('Image dimensions:', { width: w, height: h });
          resolve({ width: w, height: h });
        },
        (error) => {
          console.error('Image.getSize Error:', error);
          reject(error);
        }
      );
    });

    // Validate dimensions
    if (width <= 0 || height <= 0) {
      console.error('Invalid image dimensions:', { width, height });
      return { success: false, error: 'Invalid image dimensions' };
    }

    // Decode QR using jsQR
    const code = jsQR(bytes, width, height);
    if (code && code.data) {
      console.log('QR Code Data:', code.data);
      return { success: true, data: code.data };
    }
    console.log('No QR code found in image');
    return { success: false, error: 'No QR code found in image' };
  } catch (error: any) {
    console.error('QR Read Error:', error.message, error.stack);
    return { success: false, error: `Failed to read QR code: ${error.message}` };
  }
};