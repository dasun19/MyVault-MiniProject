import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSecureHash, generateUniqueId } from '../utils/cryptoSetup';

interface ManualIDEntryFormProps {
  onClose?: () => void;
  storageKey?: string;
  restrictToSingle?: boolean;
  editingCard?: IDCardData | null;
}

interface IDCardData {
  id: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  issuedDate: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
}

const ManualIDEntryForm: React.FC<ManualIDEntryFormProps> = ({ 
  onClose, 
  storageKey = 'single_digital_id',
  restrictToSingle = true,
  editingCard = null
}) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    issuedDate: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedHash, setSavedHash] = useState<string | null>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (editingCard) {
      setFormData({
        idNumber: editingCard.idNumber,
        fullName: editingCard.fullName,
        dateOfBirth: editingCard.dateOfBirth,
        issuedDate: editingCard.issuedDate,
      });
    }
  }, [editingCard]);

  const validateNIC = (nic: string): boolean => {
    const cleanedNIC = nic.replace(/\s/g, '').toUpperCase();
    const oldFormat = /^\d{9}[VX]$/;
    const newFormat = /^\d{12}$/;
    return oldFormat.test(cleanedNIC) || newFormat.test(cleanedNIC);
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!formData.idNumber.trim()) errors.push('ID Number is required');
    else if (!validateNIC(formData.idNumber)) errors.push('Invalid NIC format. Use 9 digits + V/X or 12 digits');
    if (!formData.fullName.trim()) errors.push('Full Name is required');
    if (!formData.dateOfBirth.trim()) errors.push('Date of Birth is required');
    else if (!validateDate(formData.dateOfBirth)) errors.push('Invalid Date of Birth format');
    if (!formData.issuedDate.trim()) errors.push('Issued Date is required');
    else if (!validateDate(formData.issuedDate)) errors.push('Invalid Issued Date format');
    return { isValid: errors.length === 0, errors };
  };

  const generateDataHash = (): string => {
    const dataString = [
      formData.idNumber.replace(/\s/g, '').toUpperCase(),
      formData.fullName.trim().toUpperCase(),
      formData.dateOfBirth,
      formData.issuedDate
    ].join('|');
    return generateSecureHash(dataString);
  };

  const checkForDuplicate = async (): Promise<boolean> => {
    if (restrictToSingle) return false; // No duplicates in single mode
    try {
      const existingDataStr = await AsyncStorage.getItem(storageKey);
      if (!existingDataStr) return false;
      const existingData: IDCardData[] = JSON.parse(existingDataStr);
      const cleanedInputNIC = formData.idNumber.replace(/\s/g, '').toUpperCase();
      return existingData.some(card => 
        card.idNumber.replace(/\s/g, '').toUpperCase() === cleanedInputNIC
      );
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const saveIDCard = async () => {
    try {
      setIsProcessing(true);
      const validation = validateForm();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      const isDuplicate = await checkForDuplicate();
      if (isDuplicate) {
        Alert.alert('Duplicate Entry', 'An ID with this number already exists.');
        return;
      }

      const hash = generateDataHash();
      const now = new Date().toISOString();

      const idCardData: IDCardData = {
        id: editingCard ? editingCard.id : generateUniqueId(),
        idNumber: formData.idNumber.replace(/\s/g, '').toUpperCase(),
        fullName: formData.fullName.trim().toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        issuedDate: formData.issuedDate,
        hash,
        createdAt: editingCard ? editingCard.createdAt : now,
        updatedAt: now,
      };

      if (restrictToSingle) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(idCardData));
      } else {
        const existingDataStr = await AsyncStorage.getItem(storageKey);
        const existingData: IDCardData[] = existingDataStr ? JSON.parse(existingDataStr) : [];
        let updatedData;
        if (editingCard) {
          updatedData = existingData.map(card => card.id === editingCard.id ? idCardData : card);
        } else {
          updatedData = [...existingData, idCardData];
        }
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
      }

      setSavedHash(hash);
      Alert.alert('Success', editingCard ? 'ID updated successfully!' : 'ID saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save ID card: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({ idNumber: '', fullName: '', dateOfBirth: '', issuedDate: '' });
    setSavedHash(null);
  };

  if (savedHash) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>✅ ID Card Saved Successfully!</Text>
        <Text style={styles.successMessage}>
          Your National ID has been securely stored with the following details:
        </Text>
        
        <View style={styles.savedDataContainer}>
          <Text style={styles.savedDataLabel}>ID Number:</Text>
          <Text style={styles.savedDataValue}>{formData.idNumber}</Text>
          
          <Text style={styles.savedDataLabel}>Name:</Text>
          <Text style={styles.savedDataValue}>{formData.fullName}</Text>
        </View>

        <View style={styles.hashContainer}>
          <Text style={styles.hashLabel}>Security Hash:</Text>
          <Text style={styles.hashValue}>{savedHash}</Text>
        </View>

    
          
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
       
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Add National ID Card</Text>
        <Text style={styles.subtitle}>
          Enter your Sri Lankan National Identity Card details
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>National ID Number</Text>
          <TextInput
            style={styles.textInput}
            value={formData.idNumber}
            onChangeText={(value) => handleInputChange('idNumber', value)}
            placeholder="e.g., 123456789V or 200012345678"
            maxLength={12}
            autoCapitalize="characters"
          />
          <Text style={styles.inputHelp}>
            {/*'Enter 9 digits + V/X (old format) or 12 digits (new format)*/}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter full name as on ID card"
            autoCapitalize="characters"
          />
          <Text style={styles.inputHelp}>
            {/*Enter your complete name as it appears on the ID card*/}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="YYYY-MM-DD (e.g., 1990-05-15)"
            maxLength={10}
          />
          <Text style={styles.inputHelp}>
            {/*Format: YYYY-MM-DD (Year-Month-Day)*/}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ID Card Issued Date</Text>
          <TextInput
            style={styles.textInput}
            value={formData.issuedDate}
            onChangeText={(value) => handleInputChange('issuedDate', value)}
            placeholder="YYYY-MM-DD (e.g., 2020-03-10)"
            maxLength={10}
          />
          <Text style={styles.inputHelp}>
            {/*Date when your ID card was issued*/}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isProcessing && styles.disabledButton]} 
          onPress={saveIDCard}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveText}>Save ID Card</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputHelp: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34c759',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  savedDataContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedDataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 10,
  },
  savedDataValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  hashContainer: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  hashLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  hashValue: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  addAnotherButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addAnotherText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    marginLeft:20,
    marginRight:20,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualIDEntryForm;