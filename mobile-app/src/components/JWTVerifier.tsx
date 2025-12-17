import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { verifySecureToken, getTokenInfo } from '../utils/jwtUtils';
import { selectImageFromGallery, readQRCodeFromImage } from '../utils/qrImageReader';
import { parseVerificationUrl } from '../utils/urlUtils';

interface EnhancedJWTVerifierProps {
  onClose: () => void;
}

const EnhancedJWTVerifier: React.FC<EnhancedJWTVerifierProps> = ({ onClose }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Request storage permission for Android
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to read QR code images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Permission error:', error);
        return false;
      }
    }
    return true;
  };

const processToken = async (input: string, source: string = 'manual') => {
  if (!input.trim()) {
    Alert.alert('Error', 'No input provided');
    return;
  }

  console.log('Processing Input:', input);  // Debug

  setIsProcessing(true);
  setProcessingStep('Parsing input...');

  try {
    // Parse the input - could be URL or direct JWT token
    const parsed = parseVerificationUrl(input);
    
    if (!parsed.isValidUrl || !parsed.token) {
      Alert.alert('Invalid Input', parsed.error || 'Could not extract valid token from input');
      setIsProcessing(false);
      return;
    }

    setProcessingStep('Verifying JWT token...');

    // Verify the extracted token
    const verificationResult = await verifySecureToken(parsed.token);
    const tokenInfo = await getTokenInfo(parsed.token);
    
    setVerificationResult({
      ...verificationResult,
      ...tokenInfo,
      rawToken: parsed.token,
      inputUrl: parsed.baseUrl ? input : null, // Store original URL if it was a URL
      source: source,
      inputType: parsed.baseUrl ? 'verification_url' : 'direct_jwt'
    });

    if (verificationResult.isValid) {
      Alert.alert('Success', 'Token verified successfully!');
    } else {
      Alert.alert('Verification Failed', verificationResult.error || 'Token verification failed');
    }

  } catch (error) {
    console.error('Token processing error:', error);
    Alert.alert('Error', 'Failed to process input: ' + (error as Error).message);
  } finally {
    setIsProcessing(false);
    setProcessingStep('');
  }
};
const handleImageUpload = async () => {
  try {
    setIsProcessing(true);
    setProcessingStep('Requesting permissions...');

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot access gallery.');
      return;
    }

    setProcessingStep('Opening image gallery...');
    const imageUri = await selectImageFromGallery();
    if (!imageUri) {
      return;
    }

    setSelectedImage(imageUri);
    setProcessingStep('Reading QR code from image...');

    const qrResult = await readQRCodeFromImage(imageUri);
    if (!qrResult.success) {
      Alert.alert('QR Read Failed', qrResult.error || 'No QR code found.');
      return;
    }

    console.log('QR Data for Processing:', qrResult.data);  // Debug
    setTokenInput(qrResult.data || '');
    await processToken(qrResult.data || '', 'image_upload');

    setProcessingStep('Verification complete!');
  } catch (error) {
    console.error('Image Upload Error:', error);
    Alert.alert('Error', `Failed to process image: ${(error as Error).message}`);
  } finally {
    setIsProcessing(false);
    setProcessingStep('');
  }
};

  const handleManualVerify = async () => {
    await processToken(tokenInput, 'manual_entry');
  };

  const clearResults = () => {
    setTokenInput('');
    setVerificationResult(null);
    setSelectedImage(null);
    setIsProcessing(false);
    setProcessingStep('');
  };

  const formatTokenForDisplay = (token: string) => {
    if (token.length > 100) {
      return token.substring(0, 50) + '...' + token.substring(token.length - 50);
    }
    return token;
  };

  const renderDataField = (key: string, value: any) => {
    const fieldLabels: Record<string, string> = {
      fullName: 'Full Name',
      idNumber: 'ID Number',
      dateOfBirth: 'Date of Birth',
      issuedDate: 'Issued Date',
      hash: 'Security Hash',
      id: 'Record ID'
    };

    return (
      <View key={key} style={styles.dataRow}>
        <Text style={styles.dataKey}>{fieldLabels[key] || key}:</Text>
        <Text style={styles.dataValue}>{String(value)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Verifier</Text>
        <Text style={styles.subtitle}>
          Upload QR code images, or paste URL to verify
        </Text>
      </View>

      {/* Upload Options */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionLabel}>Select Verification Method:</Text>
        
        <View style={styles.methodsContainer}>
          {/* Upload QR Image */}
          <TouchableOpacity 
            style={[styles.methodButton, styles.uploadButton]} 
            onPress={handleImageUpload}
            disabled={isProcessing}
          >
            <Text style={styles.methodIcon}>📷</Text>
            <Text style={styles.methodText}>Upload QR Image</Text>
            <Text style={styles.methodSubtext}>From gallery</Text>
          </TouchableOpacity>

          {/* Manual Entry */}
          <TouchableOpacity 
            style={[styles.methodButton, styles.manualButton]}
            onPress={() => {}} // Just visual indicator
          >
            <Text style={styles.methodIcon}>✏️</Text>
            <Text style={styles.methodText}>Manual Entry</Text>
            <Text style={styles.methodSubtext}>Paste URL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>{processingStep}</Text>
        </View>
      )}

      {/* Selected Image Preview */}
      {selectedImage && !isProcessing && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imagePreviewLabel}>Selected QR Image:</Text>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        </View>
      )}

      {/* Manual Token Entry */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Or Paste URL:</Text>
        <TextInput
          style={styles.tokenInput}
          value={tokenInput}
          onChangeText={setTokenInput}
          placeholder="Paste URL here or upload QR image above..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isProcessing}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.verifyButton, isProcessing && styles.disabledButton]} 
          onPress={handleManualVerify}
          disabled={isProcessing || !tokenInput.trim()}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.clearButton, isProcessing && styles.disabledButton]} 
          onPress={clearResults}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Results */}
      {verificationResult && (
        <View style={styles.resultContainer}>
          {/* Status Header */}
          <View style={[
            styles.statusBadge, 
            verificationResult.isValid ? styles.validBadge : styles.invalidBadge
          ]}>
            <Text style={styles.statusText}>
              {verificationResult.isValid ? '✅ Token Verified Successfully' : '❌ Token Verification Failed'}
            </Text>
            <Text style={styles.sourceText}>
              Source: {verificationResult.source === 'image_upload' ? 'QR Image Upload' : 'Manual Entry'}
            </Text>
          </View>

        {verificationResult.inputUrl && (
      <View style={styles.urlInfoContainer}>
        <Text style={styles.urlInfoTitle}>🔗 Verification Source:</Text>
        <Text style={styles.urlInfoText}>{verificationResult.inputUrl}</Text>
        <Text style={styles.urlInfoNote}>
        Token was extracted from verification URL
        </Text>
  </View>
)}
            

          {/* Error Display */}
          {verificationResult.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Verification Error:</Text>
              <Text style={styles.errorText}>{verificationResult.error}</Text>
              
              {verificationResult.error.includes('expired') && (
                <View style={styles.expiredTokenInfo}>
                  <Text style={styles.expiredTokenText}>
                    This token has passed its expiration time and is no longer valid for security reasons.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Verified Data Display */}
          {verificationResult.isValid && verificationResult.data && (
            <>
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>📋 Verified ID Information:</Text>
                <View style={styles.dataContent}>
                  {Object.entries(verificationResult.data).map(([key, value]) => 
                    renderDataField(key, value)
                  )}
                </View>
              </View>

              {/* Token Metadata */}
              <View style={styles.tokenMetadata}>
                <Text style={styles.metadataTitle}>🔐 Token Security Information:</Text>
                
                <View style={styles.metadataContent}>
                  {verificationResult.issuedAt && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Issued:</Text>
                      <Text style={styles.metadataValue}>
                        {verificationResult.issuedAt.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Expires:</Text>
                    <Text style={styles.metadataValue}>
                      {verificationResult.expiresAt 
                        ? verificationResult.expiresAt.toLocaleString()
                        : 'No Expiration Set'
                      }
                    </Text>
                  </View>

                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Status:</Text>
                    <Text style={[
                      styles.metadataValue, 
                      verificationResult.expiresAt && verificationResult.expiresAt > new Date() 
                        ? styles.validStatus 
                        : styles.activeStatus
                    ]}>
                      {verificationResult.expiresAt 
                        ? (verificationResult.expiresAt > new Date() ? 'Active (Not Expired)' : 'Expired')
                        : 'Active (No Expiration)'
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Raw Token Display (collapsible) */}
              <View style={styles.rawTokenContainer}>
                <Text style={styles.rawTokenLabel}>🔗 Raw JWT Token:</Text>
                <View style={styles.rawTokenBox}>
                  <Text style={styles.rawTokenText}>
                    {formatTokenForDisplay(verificationResult.rawToken)}
                  </Text>
                </View>
                <Text style={styles.rawTokenNote}>
                  This is the complete JWT token that was read from the QR code
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      <TouchableOpacity 
        style={[styles.closeButton, isProcessing && styles.disabledButton]} 
        onPress={onClose}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>Close Verifier</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  uploadButton: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  manualButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e0e0e0',
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodSubtext: {
    fontSize: 12,
    color: '#666',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  imagePreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: 'white',
    minHeight: 80,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#666',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  validBadge: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#34c759',
  },
  invalidBadge: {
    backgroundColor: '#ffeaea',
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#d73527',
    lineHeight: 18,
  },
  expiredTokenInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  expiredTokenText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 16,
  },
  dataContainer: {
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dataContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#34c759',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  dataKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 100,
    marginRight: 8,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  tokenMetadata: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginBottom: 16,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metadataContent: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 80,
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  validStatus: {
    color: '#34c759',
    fontWeight: '600',
  },
  activeStatus: {
    color: '#007AFF',
    fontWeight: '600',
  },
  rawTokenContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  rawTokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  rawTokenBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rawTokenText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  rawTokenNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    fontStyle: 'italic',
  },
   urlInfoContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  urlInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  urlInfoText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  urlInfoNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

});

export default EnhancedJWTVerifier;