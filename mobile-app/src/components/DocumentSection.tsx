// src/components/DocumentSection.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ManualIDEntryForm from './ManualIDEntryForm';
import ManualDLEntryForm from './ManualDLEntryForm';
import ManualALCForm from './ManualALCForm';                    // A/L Form
import VirtualIDCard from './VirtualIDCard';
import VirtualDrivingLicence from './VirtualDrivingLicence';
import VirtualALCertificate from './VirtualALCertificate';
import IDCardOptionsMenu from './IDCardOptionsMenu';
import ShareModal from './ShareModal';
import { User, IdCard, Scroll, FileCheck } from 'lucide-react-native';

import { DocumentConfig } from '../config/documentConfigs';

// ---------------------------------------------------------------
// Interfaces
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

// ---------------------------------------------------------------
type Props = {
  config: DocumentConfig;
};

const DocumentSection: React.FC<Props> = ({ config }) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedDocument, setSavedDocument] = useState<DocumentData | null>(null);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadSavedDocument();
    }
  }, [userId]);

  // Get current logged-in user ID
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userIdentifier = user.id || user.idNumber;
        console.log('Current user ID:', userIdentifier);
        setUserId(userIdentifier);
      } else {
        console.warn('No user data found');
        setUserId(null);
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
      setUserId(null);
    }
  };

  // Generate user-specific storage key
  const getUserStorageKey = (): string => {
    if (!userId) {
      console.warn('No userId available, using default key');
      return config.storageKey;
    }
    const userKey = `${userId}_${config.storageKey}`;
    console.log('Using storage key:', userKey);
    return userKey;
  };

  const loadSavedDocument = async () => {
    try {
      if (!userId) return;

      const storageKey = getUserStorageKey();
      const savedData = await AsyncStorage.getItem(storageKey);
      const parsedData: DocumentData | null = savedData ? JSON.parse(savedData) : null;

      if (parsedData) {
        console.log('Document loaded for user:', userId);
      } else {
        console.log('No document found for user:', userId);
      }

      setSavedDocument(parsedData);
    } catch (error) {
      console.error('Error loading document:', error);
      Alert.alert('Error', `Failed to load saved ${config.title}.`);
      setSavedDocument(null);
    }
  };

  const handleManualEntryClose = () => {
    setShowManualEntry(false);
    setShowEditModal(false);
    loadSavedDocument();
  };

  const handleDeleteCard = () => {
    Alert.alert(
      `Delete ${config.title}`,
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteDocument },
      ]
    );
  };

  const deleteDocument = async () => {
    try {
      const storageKey = getUserStorageKey();
      await AsyncStorage.removeItem(storageKey);
      setSavedDocument(null);
      setShowOptionsMenu(false);
      console.log('Document deleted for user:', userId);
      Alert.alert('Success', `${config.title} deleted successfully!`);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', `Failed to delete ${config.title}.`);
    }
  };

  const handleEditCard = () => {
    setShowOptionsMenu(false);
    setShowEditModal(true);
  };

  const renderEntryForm = (isEditMode = false) => {
    const commonProps = {
      onClose: handleManualEntryClose,
      storageKey: getUserStorageKey(),
      restrictToSingle: true,
    };

    switch (config.type) {
      case 'id_card':
        return (
          <ManualIDEntryForm
            {...commonProps}
            editingCard={isEditMode ? (savedDocument as IDCardData) : null}
          />
        );
      case 'driving_license':
        return (
          <ManualDLEntryForm
            {...commonProps}
            editingLicense={isEditMode ? (savedDocument as DrivingLicenseData) : null}
          />
        );
      case 'a_l_certificate':
        return (
          <ManualALCForm
            {...commonProps}
            editingResult={isEditMode ? (savedDocument as ALResultData) : null}
          />
        );
      default:
        return null;
    }
  };

  const renderDocumentCard = () => {
    if (!savedDocument) return null;

    switch (config.type) {
      case 'id_card':
        return (
          <VirtualIDCard cardData={savedDocument as IDCardData} showQRCode={false} />
        );
      case 'driving_license':
        return (
          <VirtualDrivingLicence
            licenseData={savedDocument as DrivingLicenseData}
            showQRCode={false}
          />
        );
      case 'a_l_certificate':
        return (
          <VirtualALCertificate
            resultData={savedDocument as ALResultData}
            showQRCode={false}
          />
        );
      default:
        return null;
    }
  };

  const renderAddSection = () => (
    <View style={styles.addIdContainer}>
      <TouchableOpacity
        style={styles.addIdCard}
        onPress={() => setShowManualEntry(true)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedCardContent}>
          <View style={styles.addCardIcon}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <View style={styles.collapsedCardInfo}>
            <Text style={styles.collapsedCardTitle}>{config.title}</Text>
            <Text style={styles.collapsedCardSubtitle}>{config.addButtonText}</Text>
          </View>
          <Text style={styles.expandIcon}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCollapsedCard = () => {
    const IconComponent = config.icon;

    return (
      <TouchableOpacity
        style={styles.collapsedCard}
        onPress={() => setIsCardExpanded(true)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedCardContent}>
          <View style={styles.collapsedCardIcon}>
            <IconComponent size={35} color="#2563eb" />
          </View>
          <View style={styles.collapsedCardInfo}>
            <Text style={styles.collapsedCardTitle}>{config.title}</Text>
            <Text style={styles.collapsedCardSubtitle}>
              {config.type === 'id_card'
                ? (savedDocument as IDCardData)?.idNumber || 'Tap to view details'
                : config.type === 'driving_license'
                ? (savedDocument as DrivingLicenseData)?.licenseNumber || 'Tap to view details'
                : config.type === 'a_l_certificate'
                ? `${(savedDocument as ALResultData)?.year || ''} • Index ${(savedDocument as ALResultData)?.indexNumber || ''}` || 'Tap to view details'
                : 'Tap to view details'}
            </Text>
          </View>
          <Text style={styles.expandIcon}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVirtualSection = () => (
    <View style={styles.virtualIdContainer}>
      <View style={styles.virtualIdHeader}>
        {isCardExpanded ? (
          <TouchableOpacity style={styles.backButton} onPress={() => setIsCardExpanded(false)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text style={styles.virtualIdTitle} />
        <TouchableOpacity style={styles.optionsButton} onPress={() => setShowOptionsMenu(true)}>
          <Text style={styles.optionsIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {isCardExpanded ? (
        <View>
          {renderDocumentCard()}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={() => setShowShareModal(true)}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        renderCollapsedCard()
      )}

      <View style={styles.menuSeparator} />
    </View>
  );

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {savedDocument ? renderVirtualSection() : renderAddSection()}

      <Modal visible={showManualEntry} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={handleManualEntryClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle} />
            <View style={styles.placeholder} />
          </View>
          {renderEntryForm(false)}
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={handleManualEntryClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit {config.title}</Text>
            <View style={styles.placeholder} />
          </View>
          {renderEntryForm(true)}
        </View>
      </Modal>

      <IDCardOptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
        cardData={savedDocument}
      />

      <ShareModal
        visible={showShareModal}
        cardData={savedDocument}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  addIdContainer: { alignItems: 'center' },
  addIdCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  collapsedCardContent: { flexDirection: 'row', alignItems: 'center' },
  addCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  addIconText: { fontSize: 28, color: '#007AFF', fontWeight: '300' },
  collapsedCardInfo: { flex: 1 },
  collapsedCardTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  collapsedCardSubtitle: { fontSize: 14, color: '#666' },
  expandIcon: { fontSize: 28, color: '#007AFF', fontWeight: '300' },
  collapsedCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  collapsedCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  virtualIdContainer: { position: 'relative' },
  virtualIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  virtualIdTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsIcon: { fontSize: 20, color: '#666', fontWeight: 'bold', transform: [{ rotate: '90deg' }] },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: { color: '#000000ff', fontSize: 16, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  shareButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  placeholder: { width: 80 },
  menuSeparator: { height: 2, backgroundColor: '#f0f0f0', marginVertical: 8, marginHorizontal: 2 },
});

export default DocumentSection;