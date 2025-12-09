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
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSecureHash, generateUniqueId } from '../utils/cryptoSetup';

interface ALResultEntryFormProps {
  onClose?: () => void;
  storageKey?: string;
  restrictToSingle?: boolean;
  editingResult?: ALResultData | null;
}

interface SubjectResult {
  subjectCode: string; // e.g., 01S, 02P
  result: string;      // A, B, C, S, F
}

interface ALResultData {
  id: string;
  fullName: string;
  year: string;
  indexNumber: string;
  stream: 'Physical Science' | 'Biological Science' | 'Commerce' | 'Arts' | 'Technology';
  zScore: string;
  subjects: SubjectResult[];
  generalTest: string;
  generalEnglish: string;
  districtRank: string;
  islandRank: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
}

const ALResultEntryForm: React.FC<ALResultEntryFormProps> = ({
  onClose,
  storageKey = 'single_al_result',
  restrictToSingle = true,
  editingResult = null,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    year: '',
    indexNumber: '',
    stream: '' as 'Physical Science' | 'Biological Science' | 'Commerce' | 'Arts' | 'Technology' | '',
    zScore: '',
    subject1Code: '',
    subject1Result: '',
    subject2Code: '',
    subject2Result: '',
    subject3Code: '',
    subject3Result: '',
    generalTest: '',
    generalEnglish: '',
    districtRank: '',
    islandRank: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [savedHash, setSavedHash] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Load logged-in user (optional – you can tie this to candidate index if needed)
  useEffect(() => {
    loadLoggedInUser();
  }, []);

  useEffect(() => {
    if (editingResult) {
      // Normalize when loading editingResult to avoid accidental whitespace/casing diffs
      setFormData({
        fullName: (editingResult.fullName || '').trim().toUpperCase(),
        year: editingResult.year || '',
        indexNumber: editingResult.indexNumber || '',
        stream: editingResult.stream,
        zScore: editingResult.zScore || '',
        subject1Code: editingResult.subjects[0]?.subjectCode || '',
        subject1Result: editingResult.subjects[0]?.result || '',
        subject2Code: editingResult.subjects[1]?.subjectCode || '',
        subject2Result: editingResult.subjects[1]?.result || '',
        subject3Code: editingResult.subjects[2]?.subjectCode || '',
        subject3Result: editingResult.subjects[2]?.result || '',
        generalTest: editingResult.generalTest || '',
        generalEnglish: editingResult.generalEnglish || '',
        districtRank: editingResult.districtRank || '',
        islandRank: editingResult.islandRank || '',
      });
    }
  }, [editingResult]);

  const loadLoggedInUser = async () => {
    try {
      setIsLoadingUser(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setLoggedInUserId(user.idNumber || user.id || 'N/A');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.fullName.trim()) errors.push('Full Name is required');
    if (!formData.year.match(/^\d{4}$/) || parseInt(formData.year) < 1950)
      errors.push('Valid Year (e.g., 2023) is required');
    if (!formData.indexNumber.match(/^\d{7}$/))
      errors.push('Index Number must be exactly 7 digits');
    if (!formData.zScore.trim()) errors.push('Z-Score is required');
    if (!['A', 'B', 'C', 'S', 'F'].includes(formData.subject1Result.toUpperCase()) && formData.subject1Code)
      errors.push('Subject 1 Result must be A, B, C, S or F');
    if (!['A', 'B', 'C', 'S', 'F'].includes(formData.subject2Result.toUpperCase()) && formData.subject2Code)
      errors.push('Subject 2 Result must be A, B, C, S or F');
    if (!['A', 'B', 'C', 'S', 'F'].includes(formData.subject3Result.toUpperCase()) && formData.subject3Code)
      errors.push('Subject 3 Result must be A, B, C, S or F');

    return { isValid: errors.length === 0, errors };
  };

  // Hash computed from identity fields only
  const generateDataHash = (): string => {
    const dataString = [
      formData.fullName.trim().toUpperCase(),
      formData.indexNumber,
      formData.zScore,
    ].join('|');
    return generateSecureHash(dataString);
  };

  const checkForDuplicate = async (): Promise<boolean> => {
    if (restrictToSingle || editingResult) return false;
    try {
      const existing = await AsyncStorage.getItem(storageKey);
      if (!existing) return false;
      const list: ALResultData[] = JSON.parse(existing);
      return list.some(r => r.indexNumber === formData.indexNumber && r.year === formData.year);
    } catch {
      return false;
    }
  };

  const saveResult = async () => {
    try {
      setIsProcessing(true);
      const validation = validateForm();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n\n'));
        return;
      }

      const isDuplicate = await checkForDuplicate();
      if (isDuplicate) {
        Alert.alert('Duplicate', 'A/L result for this index & year already exists.');
        return;
      }

      const now = new Date().toISOString();

      // Validate required fields
      if (!formData.stream) {
        Alert.alert('Validation Error', 'Please select a subject stream');
        return;
      }

      // Build subjects array (normalized)
      const subjects: SubjectResult[] = [];
      if (formData.subject1Code && formData.subject1Result)
        subjects.push({
          subjectCode: formData.subject1Code.toUpperCase(),
          result: formData.subject1Result.toUpperCase()
        });
      if (formData.subject2Code && formData.subject2Result)
        subjects.push({
          subjectCode: formData.subject2Code.toUpperCase(),
          result: formData.subject2Result.toUpperCase()
        });
      if (formData.subject3Code && formData.subject3Result)
        subjects.push({
          subjectCode: formData.subject3Code.toUpperCase(),
          result: formData.subject3Result.toUpperCase()
        });

      // ---------------------------
      // CIA Best Practice: rehash only when identity-defining fields change
      // identity fields: fullName, indexNumber, zScore
      // ---------------------------
      const normalizedFullName = formData.fullName.trim().toUpperCase();
      const normalizedIndex = formData.indexNumber;
      const normalizedZ = formData.zScore;

      const shouldRehash =
        !editingResult ||
        (editingResult.fullName || '') !== normalizedFullName ||
        (editingResult.indexNumber || '') !== normalizedIndex ||
        (editingResult.zScore || '') !== normalizedZ;

      const finalHash = shouldRehash ? generateDataHash() : (editingResult?.hash || generateDataHash());
      // ---------------------------

      const resultData: ALResultData = {
        id: editingResult?.id || generateUniqueId(),
        fullName: normalizedFullName,
        year: formData.year,
        indexNumber: normalizedIndex,
        stream: formData.stream as 'Physical Science' | 'Biological Science' | 'Commerce' | 'Arts' | 'Technology',
        zScore: normalizedZ,
        subjects,
        generalTest: formData.generalTest || '-',
        generalEnglish: formData.generalEnglish || '-',
        districtRank: formData.districtRank || '-',
        islandRank: formData.islandRank || '-',
        hash: finalHash,
        createdAt: editingResult?.createdAt || now,
        updatedAt: now,
      };

      if (restrictToSingle) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(resultData));
      } else {
        const existing = await AsyncStorage.getItem(storageKey);
        const list: ALResultData[] = existing ? JSON.parse(existing) : [];
        if (editingResult) {
          const index = list.findIndex(r => r.id === editingResult.id);
          if (index !== -1) {
            list[index] = resultData;
          } else {
            // fallback if not found
            list.push(resultData);
          }
        } else {
          list.push(resultData);
        }
        await AsyncStorage.setItem(storageKey, JSON.stringify(list));
      }

      setSavedHash(finalHash);
      Alert.alert('Success', editingResult ? 'A/L Result updated!' : 'A/L Result saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save: ' + (error?.message || String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (savedHash) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>A/L Results Saved Successfully!</Text>
        <Text style={styles.successMessage}>
          {formData.fullName} • {formData.year} • Index: {formData.indexNumber}
        </Text>
        <Text style={styles.successMessage}>Z-Score: {formData.zScore}</Text>

        <View style={styles.hashContainer}>
          <Text style={styles.hashLabel}>Security Hash</Text>
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
        <Text style={styles.title}>Add GCE A/L Results</Text>
        <Text style={styles.subtitle}>Enter your Sri Lankan A/L examination results</Text>
      </View>

      {loggedInUserId && (
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoLabel}>Logged in as:</Text>
          <Text style={styles.userInfoValue}>{loggedInUserId}</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name (as in certificate) *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.fullName}
            onChangeText={(v) => handleInputChange('fullName', v)}
            placeholder="e.g., PERERA A.B."
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Year of Examination *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.year}
            onChangeText={(v) => handleInputChange('year', v)}
            placeholder="e.g., 2023"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Index Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.indexNumber}
            onChangeText={(v) => handleInputChange('indexNumber', v)}
            placeholder="7-digit index number"
            keyboardType="number-pad"
            maxLength={7}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Subject Stream *</Text>
          <View style={[styles.textInput, { padding: 4 }]}>
            <Picker
              selectedValue={formData.stream}
              onValueChange={(value: string) => handleInputChange('stream', value)}
            >
              <Picker.Item label="Select Stream" value="" />
              <Picker.Item label="Physical Science" value="Physical Science" />
              <Picker.Item label="Biological Science" value="Biological Science" />
              <Picker.Item label="Commerce" value="Commerce" />
              <Picker.Item label="Arts" value="Arts" />
              <Picker.Item label="Technology" value="Technology" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Z-Score *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.zScore}
            onChangeText={(v) => handleInputChange('zScore', v)}
            placeholder="e.g., 1.9876 or -0.2345"
          />
        </View>

        <Text style={styles.sectionTitle}>Subject Results (Add at least 3)</Text>

        {[1, 2, 3].map((num) => (
          <View key={num} style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TextInput
              style={[styles.textInput, { flex: 1, marginRight: 8 }]}
              placeholder={`Subject ${num} Code (e.g., 01S)`}
              value={formData[`subject${num}Code` as keyof typeof formData] as string}
              onChangeText={(v) => handleInputChange(`subject${num}Code` as keyof typeof formData, v)}
              autoCapitalize="characters"
              maxLength={4}
            />
            <TextInput
              style={[styles.textInput, { width: 80 }]}
              placeholder="A/B/C/S/F"
              value={formData[`subject${num}Result` as keyof typeof formData] as string}
              onChangeText={(v) => handleInputChange(`subject${num}Result` as keyof typeof formData, v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={1}
            />
          </View>
        ))}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Common General Test Result</Text>
          <TextInput
            style={styles.textInput}
            value={formData.generalTest}
            onChangeText={(v) => handleInputChange('generalTest', v)}
            placeholder="e.g., 65"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>General English Result</Text>
          <TextInput
            style={styles.textInput}
            value={formData.generalEnglish}
            onChangeText={(v) => handleInputChange('generalEnglish', v)}
            placeholder="A/B/C/S/F"
            autoCapitalize="characters"
            maxLength={1}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainerHalf}>
            <Text style={styles.inputLabel}>District Rank</Text>
            <TextInput
              style={styles.textInput}
              value={formData.districtRank}
              onChangeText={(v) => handleInputChange('districtRank', v)}
              placeholder="e.g., 12"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.inputContainerHalf}>
            <Text style={styles.inputLabel}>Island Rank</Text>
            <TextInput
              style={styles.textInput}
              value={formData.islandRank}
              onChangeText={(v) => handleInputChange('islandRank', v)}
              placeholder="e.g., 158"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isProcessing && styles.disabledButton]}
          onPress={saveResult}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveText}>Save A/L Results</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  headerContainer: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  userInfoCard: {
    backgroundColor: '#e7f3ff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userInfoLabel: { fontSize: 14, fontWeight: '600', color: '#0056b3' },
  userInfoValue: { fontSize: 18, fontWeight: '700', color: '#007AFF', fontFamily: 'monospace' },
  formContainer: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  inputContainerHalf: { flex: 1, marginRight: 10 },
  row: { flexDirection: 'row', marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2563eb', marginBottom: 12 },
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
  disabledButton: { backgroundColor: '#ccc', shadowOpacity: 0, elevation: 0 },
  saveText: { color: 'white', fontSize: 18, fontWeight: '600' },
  successContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#34c759', textAlign: 'center', marginBottom: 16 },
  successMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 10 },
  hashContainer: { backgroundColor: '#fff7ed', padding: 20, borderRadius: 12, marginVertical: 30 },
  hashLabel: { fontSize: 14, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 8 },
  hashValue: { fontSize: 12, color: '#ea580c', fontFamily: 'monospace', textAlign: 'center', lineHeight: 18 },
  doneButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default ALResultEntryForm;
