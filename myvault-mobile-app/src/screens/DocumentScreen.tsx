// src/screens/DocumentScreen.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DocumentSection from '../components/DocumentSection';
import { ALL_DOCUMENT_CONFIGS } from '../config/documentConfigs';

type DocumentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Document'>;

type Props = {
  navigation: DocumentScreenNavigationProp;
};

const DocumentScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.logoContainer}>
        <View style={styles.logoContent}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.myvaultTitle}>MyVault</Text>
        </View>
        <Text style={styles.subtitle}>Manage your digital documents securely</Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_DOCUMENT_CONFIGS.map((config) => (
          <View key={config.id} style={styles.documentSection}>
            <DocumentSection config={config} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 16,
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  myvaultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 4,
    marginLeft:10,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  documentSection: {
    marginBottom: 24,
  },
});

export default DocumentScreen;