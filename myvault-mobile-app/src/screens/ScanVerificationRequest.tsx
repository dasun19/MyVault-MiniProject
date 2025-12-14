import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'verification_requests';
const ACCEPTED_KEY = 'accepted_requests';

export const ScanVerificationRequest = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [savedRequests, setSavedRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const device = useCameraDevice(hasPermission ? 'back' : undefined);

  useEffect(() => {
    requestPermission();
    loadSavedRequests();
    loadAcceptedRequests();
  }, []);

  const requestPermission = async () => {
    const permission = await Camera.requestCameraPermission();

    if (permission === 'denied') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permission in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      setHasPermission(false);
      return;
    }

    setHasPermission(true);
  };

  const loadSavedRequests = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) setSavedRequests(JSON.parse(stored));
  };

  const loadAcceptedRequests = async () => {
    const stored = await AsyncStorage.getItem(ACCEPTED_KEY);
    if (stored) setAcceptedRequests(JSON.parse(stored));
  };

  const saveAccepted = async (req) => {
    const updated = [...acceptedRequests, req];
    setAcceptedRequests(updated);
    await AsyncStorage.setItem(ACCEPTED_KEY, JSON.stringify(updated));
  };

  const removeRequest = async (id) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = savedRequests.filter((r: any) => r.id !== id);
            setSavedRequests(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const clearAccepted = async () => {
    Alert.alert(
      'Clear All Accepted',
      'Are you sure you want to clear all accepted requests?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setSavedRequests([]);
          },
        },
      ]
    );
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (!isActive || !codes.length) return;
      const qrData = codes[0]?.value;
      if (!qrData) return;

      setIsActive(false);
      handleQR(qrData);
    },
  });

  const handleQR = async (data: string) => {
    try {
      const parsed = JSON.parse(data);

      if (!parsed.verifier || !parsed.documentType || !parsed.description || !parsed.publicKey) {
        Alert.alert('Invalid QR Code', 'This is not a valid verification request.', [
          { text: 'OK', onPress: () => setIsActive(true) },
        ]);
        return;
      }

      const newRequest = {
        id: Date.now().toString(),
        verifier: parsed.verifier,
        documentType: parsed.documentType,
        description: parsed.description,
        publicKey: parsed.publicKey,
        scannedAt: new Date().toISOString(),
      };

      Alert.alert(
        'Verification Request',
        `Verifier: ${parsed.verifier}\n\nDocument Type: ${parsed.documentType}\n\nDescription: ${parsed.description}`,
        [
          {
            text: 'Decline',
            style: 'destructive',
            onPress: () => setIsActive(true),
          },
          {
            text: 'Accept',
            onPress: async () => {
              const updated = [...savedRequests, newRequest];
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              setSavedRequests(updated);
              setIsActive(true);
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'QR code parsing failed.', [
        { text: 'OK', onPress: () => setIsActive(true) },
      ]);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>📷 Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant camera permission to scan QR codes
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Section */}
      <View style={styles.cameraSection}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanInstruction}>
            Position QR code within frame
          </Text>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView style={styles.listSection} showsVerticalScrollIndicator={false}>
        {/* Accepted Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accepted Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedRequests.length}</Text>
            </View>
          </View>

          {savedRequests.length > 0 && (
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearAccepted}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}

          {savedRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No accepted requests</Text>
              <Text style={styles.emptySubtext}>Accept requests to see them here</Text>
            </View>
          ) : (
            savedRequests.map((req: any) => (
              <View key={req.id} style={[styles.card, styles.cardAccepted]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{req.documentType}</Text>
                  <Text style={styles.cardDescription}>
                      Verifier: {req.verifier}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeRequest(req.id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardDescription}>{req.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardTime}>
                    🕐 {formatDate(req.scannedAt)}
                  </Text>
                  <Text style={styles.cardKey} numberOfLines={1}>
                    🔑 {req.publicKey.substring(0, 16)}...
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraSection: {
    height: 280,
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 14,
    marginTop: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 10,
  },
  badge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  clearAllBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardAccepted: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    gap: 6,
  },
  cardTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardKey: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: '#374151',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});