// src/components/ShareModal.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import RSA from 'react-native-rsa-native';


// ────────────────────────────────
// Document Interfaces
// ────────────────────────────────
interface BaseDocumentData {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

interface IDCardData extends BaseDocumentData {
  idNumber: string;
  issuedDate: string;
  dateOfBirth: string;
}

interface DrivingLicenseData extends BaseDocumentData {
  idNumber?: string;
  licenseNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  address?: string;
  bloodGroup?: string;
  vehicleClasses?: string[];
}

interface ALResultData extends BaseDocumentData {
  year: string;
  indexNumber: string;
  stream: string;
  zScore: string;
  subjects: { subjectCode: string; result: string }[];
  generalTest: string;
  generalEnglish: string;
  districtRank: string;
  islandRank: string;
}

type DocumentData = IDCardData | DrivingLicenseData | ALResultData;

interface VerificationRequest {
  id: string;
  verifier: string;
  description: string;
  publicKey: string;
  scannedAt: string;
}

// ────────────────────────────────
// Props
// ────────────────────────────────
type Props = {
  visible: boolean;
  cardData: DocumentData | null;
  onClose: () => void;
};

// ────────────────────────────────
// Helper: Get available fields
// ────────────────────────────────
const getAvailableFields = (cardData: DocumentData | null): { key: string; label: string }[] => {
  if (!cardData) return [];

  if ('year' in cardData && 'indexNumber' in cardData && 'zScore' in cardData) {
    return [
      { key: 'fullName', label: 'Full Name' },
      { key: 'year', label: 'Examination Year' },
      { key: 'indexNumber', label: 'Index Number' },
      { key: 'stream', label: 'Subject Stream' },
      { key: 'zScore', label: 'Z-Score' },
      { key: 'subjects', label: 'Subject Results' },
      { key: 'generalTest', label: 'Common General Test' },
      { key: 'generalEnglish', label: 'General English' },
      { key: 'districtRank', label: 'District Rank' },
      { key: 'islandRank', label: 'Island Rank' },
    ];
  }

  if ('idNumber' in cardData && 'issuedDate' in cardData) {
    return [
      { key: 'fullName', label: 'Full Name' },
      { key: 'idNumber', label: 'ID Number' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'issuedDate', label: 'Issued Date' },
    ];
  }

  if ('licenseNumber' in cardData) {
    const fields = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'licenseNumber', label: 'License Number' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'dateOfIssue', label: 'Date of Issue' },
      { key: 'dateOfExpiry', label: 'Date of Expiry' },
      { key: 'vehicleClasses', label: 'Vehicle Classes' },
    ];

    if (cardData.idNumber) {
      fields.splice(2, 0, { key: 'idNumber', label: 'NIC Number' });
    }
    if (cardData.bloodGroup) {
      fields.push({ key: 'bloodGroup', label: 'Blood Group' });
    }
    if (cardData.address) {
      fields.push({ key: 'address', label: 'Address' });
    }

    return fields;
  }

  return [];
};

// ────────────────────────────────
// RSA Encryption Helper (React Native Compatible)
// ────────────────────────────────
const encryptWithRSA = async (data: string, publicKeyPEM: string): Promise<string> => {
  try {
    // The publicKey is now directly in PEM format (not base64 encoded)
    // react-native-rsa-native expects PEM format
    const encrypted = await RSA.encrypt(data, publicKeyPEM);
    
    return encrypted;
  } catch (error) {
    console.error('RSA encryption error:', error);
    throw error;
  }
};

const STORAGE_KEY = 'verification_requests';

// ────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────
export const ShareModal: React.FC<Props> = ({ visible, cardData, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [encryptData, setEncryptData] = useState(false);
  const [selectedVerifier, setSelectedVerifier] = useState<string>('');
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShot>(null);

  // Load verification requests
  React.useEffect(() => {
    if (visible) {
      loadVerificationRequests();
    }
  }, [visible]);

  const loadVerificationRequests = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVerificationRequests(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible && cardData) {
      const fields = getAvailableFields(cardData);
      const initial: Record<string, boolean> = {};
      fields.forEach((field) => {
        initial[field.key] = true;
      });
      setSelectedFields(initial);
      setEncryptData(false);
      setSelectedVerifier('');
      setQrValue(null);
    }
  }, [visible, cardData]);

  const handleGenerateQR = async () => {
    if (!cardData) return;

    if (encryptData && !selectedVerifier) {
      Alert.alert('Select Verifier', 'Please select a verification request to encrypt the data.');
      return;
    }

    const data: Record<string, any> = {};

    for (const key in selectedFields) {
      if (selectedFields[key]) {
        const value = (cardData as any)[key];

        if (key === 'subjects' && Array.isArray(value)) {
          data[key] = value.map((s: any) => `${s.subjectCode}: ${s.result}`).join(', ');
        } else if (Array.isArray(value)) {
          data[key] = value.join(', ');
        } else {
          data[key] = value || '-';
        }
      }
    }

    if (cardData.hash) {
      data.hash = cardData.hash;
    }

    let payload: string;

    if (encryptData) {
      const verifier = verificationRequests.find((v) => v.id === selectedVerifier);
      if (!verifier) {
        Alert.alert('Error', 'Selected verifier not found.');
        return;
      }

      try {
        const jsonString = JSON.stringify(data);
        const encrypted = await encryptWithRSA(jsonString, verifier.publicKey);
        
        // Base64 URL-safe encoding
        payload = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } catch (error) {
        Alert.alert('Encryption Failed', 'Failed to encrypt data with verifier public key.');
        console.error('Encryption error:', error);
        return;
      }
    } else {
      // Normal non-encrypted QR code generation (using btoa equivalent)
      const jsonString = JSON.stringify(data, null, 2);
      // Convert to base64 using Buffer (React Native compatible)
      const base64String = btoa(jsonString);
      payload = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    const verificationUrl = `https://myvault-verify.vercel.app/verify?data=${encodeURIComponent(payload)}`;
    setQrValue(verificationUrl);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to save QR code.',
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

  const handleShareQR = async () => {
    if (!viewShotRef.current || !qrValue) return;
    try {
      const uri = await viewShotRef.current.capture();
      await Share.open({ url: `file://${uri}` });
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code.');
    }
  };

  const handleSaveQR = async () => {
    if (!viewShotRef.current || !qrValue) return;
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot save without storage permission.');
      return;
    }
    try {
      const uri = await viewShotRef.current.capture();
      await CameraRoll.save(uri, { type: 'photo' });
      Alert.alert('Success', 'QR code saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save QR code.');
    }
  };

  const handleClose = () => {
    setQrValue(null);
    setEncryptData(false);
    setSelectedVerifier('');
    setSelectedFields({});
    onClose();
  };

  const availableFields = getAvailableFields(cardData);
  const selectedVerifierData = verificationRequests.find((v) => v.id === selectedVerifier);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.shareModalOverlay}>
        <View style={styles.shareModalContainer}>
          <Text style={styles.shareTitle}>Share Document via QR</Text>

          {!qrValue ? (
            <>
              <Text style={styles.sectionLabel}>Select fields to share:</Text>
              <ScrollView style={styles.fieldsScrollView}>
                {availableFields.map((field) => {
                  const hasValue = cardData && (cardData as any)[field.key] !== undefined;
                  if (!hasValue) return null;
                  return (
                    <View key={field.key} style={styles.checkboxRow}>
                      <CheckBox
                        value={selectedFields[field.key] || false}
                        onValueChange={(v) =>
                          setSelectedFields({ ...selectedFields, [field.key]: v })
                        }
                      />
                      <Text style={styles.checkboxLabel}>{field.label}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionLabel}>Encrypt for Verifier?</Text>
              <View style={styles.encryptRow}>
                <CheckBox value={encryptData} onValueChange={setEncryptData} />
                <Text style={styles.checkboxLabel}>
                  Yes, encrypt data (only selected verifier can decrypt)
                </Text>
              </View>

              {encryptData && (
                <>
                  {verificationRequests.length === 0 ? (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        No verification requests found. Please scan a verification request QR code first.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.sectionLabel}>Select Verifier:</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={selectedVerifier}
                          onValueChange={(value) => setSelectedVerifier(value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="-- Select Verifier --" value="" />
                          {verificationRequests.map((request) => (
                            <Picker.Item
                              key={request.id}
                              label={`${request.verifier} - ${new Date(request.scannedAt).toLocaleDateString()}`}
                              value={request.id}
                            />
                          ))}
                        </Picker>
                      </View>

                      {selectedVerifierData && (
                        <View style={styles.verifierInfo}>
                          <Text style={styles.verifierInfoTitle}>Selected Verifier:</Text>
                          <Text style={styles.verifierInfoText}>
                            <Text style={styles.bold}>Verifier:</Text> {selectedVerifierData.verifier}
                          </Text>
                          <Text style={styles.verifierInfoText}>
                            <Text style={styles.bold}>Description:</Text> {selectedVerifierData.description}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.generateButton} onPress={handleGenerateQR}>
                  <Text style={styles.buttonText}>Generate QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeShareButton} onPress={handleClose}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ScrollView style={styles.qrContainer}>
              <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={qrValue}
                    size={220}
                    logo={require('../assets/images/logo.png')}
                    logoSize={35}
                    logoBackgroundColor="white"
                  />
                  <Text style={styles.qrLabel}>
                    {encryptData ? 'Encrypted Document' : 'Document Data'}
                  </Text>
                  {encryptData && selectedVerifierData && (
                    <Text style={styles.encryptedLabel}>
                      Encrypted for: {selectedVerifierData.verifier}
                    </Text>
                  )}
                </View>
              </ViewShot>

              {encryptData && selectedVerifierData && (
                <View style={styles.encryptedInfoBox}>
                  <Text style={styles.encryptedInfoText}>
                    ✓ This document is encrypted with RSA and can only be decrypted by the verifier using their private key.
                  </Text>
                </View>
              )}

              <View style={styles.qrShareButtons}>
                <TouchableOpacity style={styles.shareQrButton} onPress={handleShareQR}>
                  <Text style={styles.buttonText}>Share QR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveQrButton} onPress={handleSaveQR}>
                  <Text style={styles.buttonText}>Save to Gallery</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cancelBtnContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ────────────────────────────────
// Styles
// ────────────────────────────────
const styles = StyleSheet.create({
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    maxHeight: '92%',
  },
  shareTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    color: '#374151',
  },
  fieldsScrollView: {
    maxHeight: 180,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#4b5563',
  },
  encryptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 8,
  },
  picker: {
    height: 50,
  },
  verifierInfo: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  verifierInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  verifierInfoText: {
    fontSize: 13,
    color: '#1f2937',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  closeShareButton: {
    flex: 1,
    backgroundColor: '#9ca3af',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  qrContainer: {
    marginTop: 12,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  qrLabel: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  encryptedLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  encryptedInfoBox: {
    marginTop: 16,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  encryptedInfoText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  qrShareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  shareQrButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveQrButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelBtnContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareModal;