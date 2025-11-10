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

interface ManualLicenseEntryFormProps {
  onClose?: () => void;
  storageKey?: string;
  restrictToSingle?: boolean;
  editingLicense?: DrivingLicenseData | null;
}

interface DrivingLicenseData {
  id: string;
  licenseNumber: string;
  fullName: string;
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  address?: string;
  bloodGroup?: string;
  vehicleClasses?: string[];
  hash: string;
  createdAt: string;
  updatedAt: string;
}

const ManualLicenseEntryForm: React.FC<ManualLicenseEntryFormProps> = ({ 
  onClose, 
  storageKey = 'single_driving_license',
  restrictToSingle = true,
  editingLicense = null
}) => {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    fullName: '',
    dateOfBirth: '',
    dateOfIssue: '',
    dateOfExpiry: '',
    address: '',
    bloodGroup: '',
    vehicleClasses: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedHash, setSavedHash] = useState<string | null>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (editingLicense) {
      setFormData({
        licenseNumber: editingLicense.licenseNumber,
        fullName: editingLicense.fullName,
        dateOfBirth: editingLicense.dateOfBirth,
        dateOfIssue: editingLicense.dateOfIssue,
        dateOfExpiry: editingLicense.dateOfExpiry,
        address: editingLicense.address || '',
        bloodGroup: editingLicense.bloodGroup || '',
        vehicleClasses: editingLicense.vehicleClasses?.join(', ') || '',
      });
    }
  }, [editingLicense]);

  const validateLicenseNumber = (licenseNum: string): boolean => {
    const cleaned = licenseNum.replace(/\s/g, '').toUpperCase();
    // Sri Lankan license format: Letter followed by 7 digits (e.g., B1234567)
    const licenseFormat = /^[A-Z]\d{7}$/;
    return licenseFormat.test(cleaned);
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validateBloodGroup = (bg: string): boolean => {
    if (!bg) return true; // Optional field
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validGroups.includes(bg.toUpperCase());
  };

  const validateVehicleClasses = (classes: string): boolean => {
    if (!classes.trim()) return false;
    const validClasses = ['A', 'A1', 'B', 'B1', 'C', 'C1', 'CE', 'D', 'D1', 'DE', 'G', 'J'];
    const inputClasses = classes.split(',').map(c => c.trim().toUpperCase());
    return inputClasses.every(c => validClasses.includes(c));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.licenseNumber.trim()) {
      errors.push('License Number is required');
    } else if (!validateLicenseNumber(formData.licenseNumber)) {
      errors.push('Invalid License Number format. Use format: B1234567');
    }
    
    if (!formData.fullName.trim()) {
      errors.push('Full Name is required');
    }
    
    if (!formData.dateOfBirth.trim()) {
      errors.push('Date of Birth is required');
    } else if (!validateDate(formData.dateOfBirth)) {
      errors.push('Invalid Date of Birth format');
    }
    
    if (!formData.dateOfIssue.trim()) {
      errors.push('Date of Issue is required');
    } else if (!validateDate(formData.dateOfIssue)) {
      errors.push('Invalid Date of Issue format');
    }
    
    if (!formData.dateOfExpiry.trim()) {
      errors.push('Date of Expiry is required');
    } else if (!validateDate(formData.dateOfExpiry)) {
      errors.push('Invalid Date of Expiry format');
    } else {
      const issueDate = new Date(formData.dateOfIssue);
      const expiryDate = new Date(formData.dateOfExpiry);
      if (expiryDate <= issueDate) {
        errors.push('Expiry date must be after issue date');
      }
    }
    
    if (formData.bloodGroup && !validateBloodGroup(formData.bloodGroup)) {
      errors.push('Invalid blood group. Use: A+, A-, B+, B-, AB+, AB-, O+, O-');
    }
    
    if (!formData.vehicleClasses.trim()) {
      errors.push('Vehicle Classes are required');
    } else if (!validateVehicleClasses(formData.vehicleClasses)) {
      errors.push('Invalid vehicle classes. Use: A, A1, B, B1, C, C1, CE, D, D1, DE, G, J');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const generateDataHash = (): string => {
    const dataString = [
      formData.licenseNumber.replace(/\s/g, '').toUpperCase(),
      formData.fullName.trim().toUpperCase(),
      formData.dateOfBirth,
      formData.dateOfIssue,
      formData.dateOfExpiry,
      formData.vehicleClasses.replace(/\s/g, '').toUpperCase()
    ].join('|');
    return generateSecureHash(dataString);
  };

  const checkForDuplicate = async (): Promise<boolean> => {
    if (restrictToSingle) return false;
    try {
      const existingDataStr = await AsyncStorage.getItem(storageKey);
      if (!existingDataStr) return false;
      const existingData: DrivingLicenseData[] = JSON.parse(existingDataStr);
      const cleanedInputLicense = formData.licenseNumber.replace(/\s/g, '').toUpperCase();
      return existingData.some(license => 
        license.licenseNumber.replace(/\s/g, '').toUpperCase() === cleanedInputLicense
      );
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const saveLicense = async () => {
    try {
      setIsProcessing(true);
      const validation = validateForm();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      const isDuplicate = await checkForDuplicate();
      if (isDuplicate) {
        Alert.alert('Duplicate Entry', 'A license with this number already exists.');
        return;
      }

      const hash = generateDataHash();
      const now = new Date().toISOString();

      const vehicleClassesArray = formData.vehicleClasses
        .split(',')
        .map(c => c.trim().toUpperCase())
        .filter(c => c);

      const licenseData: DrivingLicenseData = {
        id: editingLicense ? editingLicense.id : generateUniqueId(),
        licenseNumber: formData.licenseNumber.replace(/\s/g, '').toUpperCase(),
        fullName: formData.fullName.trim().toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        dateOfIssue: formData.dateOfIssue,
        dateOfExpiry: formData.dateOfExpiry,
        address: formData.address.trim() || undefined,
        bloodGroup: formData.bloodGroup.toUpperCase() || undefined,
        vehicleClasses: vehicleClassesArray,
        hash,
        createdAt: editingLicense ? editingLicense.createdAt : now,
        updatedAt: now,
      };

      if (restrictToSingle) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(licenseData));
      } else {
        const existingDataStr = await AsyncStorage.getItem(storageKey);
        const existingData: DrivingLicenseData[] = existingDataStr ? JSON.parse(existingDataStr) : [];
        let updatedData;
        if (editingLicense) {
          updatedData = existingData.map(license => license.id === editingLicense.id ? licenseData : license);
        } else {
          updatedData = [...existingData, licenseData];
        }
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
      }

      setSavedHash(hash);
      Alert.alert('Success', editingLicense ? 'License updated successfully!' : 'License saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save license: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      licenseNumber: '',
      fullName: '',
      dateOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: '',
      address: '',
      bloodGroup: '',
      vehicleClasses: '',
    });
    setSavedHash(null);
  };

  if (savedHash) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>✅ Driving License Saved Successfully!</Text>
        <Text style={styles.successMessage}>
          Your driving license has been securely stored with the following details:
        </Text>
        
        <View style={styles.savedDataContainer}>
          <Text style={styles.savedDataLabel}>License Number:</Text>
          <Text style={styles.savedDataValue}>{formData.licenseNumber}</Text>
          
          <Text style={styles.savedDataLabel}>Name:</Text>
          <Text style={styles.savedDataValue}>{formData.fullName}</Text>
          
          <Text style={styles.savedDataLabel}>Vehicle Classes:</Text>
          <Text style={styles.savedDataValue}>{formData.vehicleClasses}</Text>
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
        <Text style={styles.title}>Add Driving License</Text>
        <Text style={styles.subtitle}>
          Enter your Sri Lankan Driving License details
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>License Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange('licenseNumber', value)}
            placeholder="e.g., B1234567"
            maxLength={8}
            autoCapitalize="characters"
          />
          <Text style={styles.inputHelp}>
            Format: Letter + 7 digits (e.g., B1234567)
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter full name as on license"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date of Birth *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="YYYY-MM-DD (e.g., 1990-05-15)"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date of Issue *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dateOfIssue}
            onChangeText={(value) => handleInputChange('dateOfIssue', value)}
            placeholder="YYYY-MM-DD (e.g., 2020-03-10)"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date of Expiry *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dateOfExpiry}
            onChangeText={(value) => handleInputChange('dateOfExpiry', value)}
            placeholder="YYYY-MM-DD (e.g., 2025-03-09)"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Vehicle Classes *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.vehicleClasses}
            onChangeText={(value) => handleInputChange('vehicleClasses', value)}
            placeholder="e.g., A, B1, B"
            autoCapitalize="characters"
          />
          <Text style={styles.inputHelp}>
            Separate multiple classes with commas (e.g., A, B1, B)
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Blood Group (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.bloodGroup}
            onChangeText={(value) => handleInputChange('bloodGroup', value)}
            placeholder="e.g., A+, B-, O+"
            maxLength={3}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Address (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isProcessing && styles.disabledButton]} 
          onPress={saveLicense}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveText}>Save Driving License</Text>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHelp: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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
    backgroundColor: '#fff7ed',
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
    color: '#ea580c',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  doneButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualLicenseEntryForm;