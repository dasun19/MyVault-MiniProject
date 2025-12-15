import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Phone, CreditCard, Calendar, LogOut, Trash2, Save } from 'lucide-react-native';
import AppHeader from '../components/AppHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from 'react-i18next';
import { getServerUrl } from '../components/ApiSettings';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation(); // 
  
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed);
        setFullName(parsed.fullName || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phoneNumber || '');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const baseUrl = await getServerUrl();
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`${baseUrl}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email, phoneNumber }),
      });
      const data = await res.json();

      if (data.success) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        setIsEditing(false);
        Alert.alert(t('profile.successTitle'), t('profile.profileUpdated'));
      } else {
        Alert.alert(t('profile.updateFailed'), data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(t('profile.errorTitle'), t('profile.couldNotUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      t('profile.deleteAccountTitle'),
      t('profile.deleteAccountMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const baseUrl = await getServerUrl();
              const token = await AsyncStorage.getItem('authToken');
              await fetch(`${baseUrl}/api/auth/delete`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              await AsyncStorage.clear();
              navigation.replace('Login');
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await AsyncStorage.multiRemove([
              'authToken',
              'userData',
              'userPin',
              'biometricEnabled',
              'securitySetupComplete',
              'pinLoginEnabled',
              'registrationEmail'
            ]);
            
            console.log('✅ Logout complete - navigating to Welcome');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          } catch (error) {
            console.error('❌ Logout error:', error);
            Alert.alert(t('profile.errorTitle'), t('profile.logoutFailed'));
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const toggleEdit = () => {
    if (isEditing) {
      setFullName(user?.fullName || '');
      setEmail(user?.email || '');
      setPhone(user?.phoneNumber || '');
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('profile.title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('profile.title')} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#2563eb" />
          </View>
          <Text style={styles.userName}>{fullName || 'User'}</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={toggleEdit}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? t('profile.cancel') : t('profile.editProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile.personalInformation')}</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <User size={20} color="#666" />
              <Text style={styles.labelText}>{t('profile.fullName')}</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullName')}
              editable={isEditing}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Mail size={20} color="#666" />
              <Text style={styles.labelText}>{t('profile.email')}</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('profile.email')}
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Phone size={20} color="#666" />
              <Text style={styles.labelText}>{t('profile.phoneNumber')}</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={phoneNumber}
              onChangeText={setPhone}
              placeholder={t('profile.phoneNumber')}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={updateProfile}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Account Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile.accountDetails')}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <CreditCard size={20} color="#666" />
              <Text style={styles.detailLabelText}>{t('profile.nationalId')}</Text>
            </View>
            <Text style={styles.detailValue}>{user?.idNumber || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <Calendar size={20} color="#666" />
              <Text style={styles.detailLabelText}>{t('profile.memberSince')}</Text>
            </View>
            <Text style={styles.detailValue}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <LogOut size={20} color="#fff" />
                <Text style={styles.buttonText}>{t('profile.logOut')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteAccount}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.buttonText}>{t('profile.deleteAccount')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabelText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});