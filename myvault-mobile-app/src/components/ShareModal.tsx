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
  Clipboard,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import CryptoJS from 'crypto-js';

// Base interface for all documents
interface BaseDocumentData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

interface IDCardData extends BaseDocumentData {
  idNumber: string;
  issuedDate: string;
}

interface DrivingLicenseData extends BaseDocumentData {
  licenseNumber: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  address?: string;
  bloodGroup?: string;
  vehicleClasses?: string[];
}

type DocumentData = IDCardData | DrivingLicenseData;

type Props = {
  visible: boolean;
  cardData: DocumentData | null;
  onClose: () => void;
};

// Helper to get available fields
const getAvailableFields = (cardData: DocumentData | null): { key: string; label: string }[] => {
  if (!cardData) return [];

  const commonFields = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    
  ];

  if ('idNumber' in cardData) {
    return [
      ...commonFields.slice(0, 1),
      { key: 'idNumber', label: 'ID Number' },
      ...commonFields.slice(1, 2),
      { key: 'issuedDate', label: 'Issued Date' },
      ...commonFields.slice(2),
    ];
  }

  if ('licenseNumber' in cardData) {
    return [
      ...commonFields.slice(0, 1),
      { key: 'licenseNumber', label: 'License Number' },
      ...commonFields.slice(1, 2),
      { key: 'dateOfIssue', label: 'Date of Issue' },
      { key: 'dateOfExpiry', label: 'Date of Expiry' },
      { key: 'vehicleClasses', label: 'Vehicle Classes' },
      { key: 'bloodGroup', label: 'Blood Group' },
      ...commonFields.slice(2),
    ];
  }

  return commonFields;
};

// Generate random 12-char alphanumeric passkey
const generatePasskey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const VERIFICATION_URL = 'https://your-verification-site.com/verify';

// EXPORTED COMPONENT
export const ShareModal: React.FC<Props> = ({ visible, cardData, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [encryptData, setEncryptData] = useState(false);
  const [passkey, setPasskey] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShot>(null);

  // Initialize selected fields
  React.useEffect(() => {
    if (visible && cardData) {
      const fields = getAvailableFields(cardData);
      const initial: Record<string, boolean> = {};
      fields.forEach((field) => {
        initial[field.key] =
          field.key !== 'hash' &&
          field.key !== 'bloodGroup' &&
          field.key !== 'address';
      });
      setSelectedFields(initial);
      setEncryptData(false);
      setPasskey(null);
      setQrValue(null);
    }
  }, [visible, cardData]);

  const toBase64Url = (str: string) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromBase64Url = (str: string) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
};

  const handleGenerateQR = () => {
  if (!cardData) return;

  const data: Record<string, any> = {};
  for (const key in selectedFields) {
    if (selectedFields[key] && cardData[key as keyof DocumentData]) {
      data[key] = cardData[key as keyof DocumentData];
    }
  }

  // ALWAYS ADD HASH — even if not in UI
  if (cardData.hash) {
    data.hash = cardData.hash;
  }

  let payload: string;
  let newPasskey: string | null = null;

  if (encryptData) {
    newPasskey = generatePasskey();
    const jsonString = JSON.stringify(data);
    const key = CryptoJS.enc.Utf8.parse(newPasskey.padEnd(16, '0'));
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    // URL-safe Base64
    payload = btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    payload = btoa(JSON.stringify(data, null, 2))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  setPasskey(newPasskey);

  // THIS IS THE FIX: Generate FULL URL
  const verificationUrl = `http://localhost:5173/verify?data=${encodeURIComponent(payload)}`;
  setQrValue(verificationUrl); // QR now contains the URL
};

  const copyPasskey = () => {
    if (passkey) {
      Clipboard.setString(passkey);
      Alert.alert('Copied!', 'Passkey copied to clipboard.');
    }
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
    setPasskey(null);
    setEncryptData(false);
    setSelectedFields({});
    onClose();
  };

  const availableFields = getAvailableFields(cardData);

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
                  if (cardData && !cardData[field.key as keyof DocumentData]) return null;
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

              <Text style={styles.sectionLabel}>Encrypt QR Data?</Text>
              <View style={styles.encryptRow}>
                <CheckBox
                  value={encryptData}
                  onValueChange={setEncryptData}
                />
                <Text style={styles.checkboxLabel}>
                  Yes, encrypt data (requires passkey to decrypt)
                </Text>
              </View>

              {encryptData && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    A passkey will be generated. Only someone with this passkey can decrypt the data.
                  </Text>
                </View>
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
                    {encryptData ? 'Encrypted Data' : 'Document Data'}
                  </Text>
                  {encryptData && (
                    <Text style={styles.encryptedLabel}>Locked (Requires Passkey)</Text>
                  )}
                </View>
              </ViewShot>

              {encryptData && passkey && (
                <View style={styles.passkeyContainer}>
                  <Text style={styles.passkeyTitle}>Your Decryption Passkey:</Text>
                  <View style={styles.passkeyBox}>
                    <Text style={styles.passkeyText}>{passkey}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyButton} onPress={copyPasskey}>
                    <Text style={styles.copyButtonText}>Copy Passkey</Text>
                  </TouchableOpacity>
                  <Text style={styles.passkeyNote}>
                    Share this passkey securely with the recipient.
                  </Text>
                </View>
              )}

              {/* {!encryptData && (
                <View style={styles.plainDataBox}>
                  <Text style={styles.plainDataTitle}>Data in QR (Plain Text):</Text>
                  <Text style={styles.plainDataText} numberOfLines={10}>
                    {qrValue}
                  </Text>
                </View>
              )} */}

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

// STYLES
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
    color: '#dc2626',
    fontWeight: '500',
  },
  passkeyContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  passkeyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  passkeyBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 180,
    alignItems: 'center',
  },
  passkeyText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    letterSpacing: 1,
    color: '#111827',
  },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  passkeyNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  plainDataBox: {
    marginTop: 20,
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  plainDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  plainDataText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#1f2937',
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
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareModal;