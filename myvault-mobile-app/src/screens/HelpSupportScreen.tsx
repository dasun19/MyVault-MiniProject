// screens/HelpScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const HelpScreen = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('more.helpSupport')} showBackButton />
      <View style={styles.content}>
        <Text style={styles.title}>{t('common.comingSoon') ?? 'Help & Support'}</Text>
        <Text style={styles.message}>
          {t('help.comingSoonMessage') ?? 'This section is under development.\nWe\'ll add helpful resources soon!'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});