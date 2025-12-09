import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Modal, 
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import { User, FileText, Shield, ShieldCheck, Lock, Link, Link2, CircleCheck, QrCode, Share2, Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation(); // ✅ ADD THIS
    
    const [showJWTVerifier, setShowJWTVerifier] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1));
    const [showFirstAd, setShowFirstAd] = useState(true); 
      
    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                setShowFirstAd((prev) => !prev);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.advertisements}>
                    <Animated.View style={[styles.advertisement, { opacity: fadeAnim }]}>
                        <Text style={styles.adText}>
                            {showFirstAd
                                ? t('home.adText1')
                                : t('home.adText2')}
                        </Text>
                    </Animated.View>
                </View>

                {/* Quick Actions Section */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
                    
                    <View style={styles.actionsGrid}>
                        {/* Navigate to Documents */}
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => {
                                navigation.navigate('BottomTabs', { 
                                    screen: 'My Documents' 
                                })
                            }}
                        >
                            <View style={styles.actionIconContainer}>
                                <FileText size={35} color="#2563eb" />
                            </View>
                            <Text style={styles.actionTitle}>{t('home.myDocuments')}</Text>
                            <Text style={styles.actionSubtitle}>
                                {t('home.myDocumentsSubtitle')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={styles.actionIconContainer}>
                                <User size={38} color="#2563eb" />
                            </View>
                            <Text style={styles.actionTitle}>{t('home.profile')}</Text>
                            <Text style={styles.actionSubtitle}>
                                {t('home.profileSubtitle')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security Information Section */}
                <View style={styles.securityInfoSection}>
                    <Text style={styles.sectionTitle}>{t('home.keyFeatures')}</Text>
                    
                    <View style={styles.securityInfoCard}>
                        <View style={styles.securityFeature}>
                            <Shield size={35} color="#2563eb" style={styles.securityFeatureIcon} />
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>{t('home.feature1Title')}</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    {t('home.feature1Desc')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.securityFeature}>
                            <CircleCheck size={35} color="#2563eb" style={styles.securityFeatureIcon} />
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>{t('home.feature2Title')}</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    {t('home.feature2Desc')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.securityFeature}>
                            <QrCode size={35} color="#2563eb" style={styles.securityFeatureIcon} />
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>{t('home.feature3Title')}</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    {t('home.feature3Desc')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    logoContainer: {
        height: 120,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 30,
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 2,
    },
    myvaultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    advertisements: {
        backgroundColor: '#2563eb',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '95%',
        marginLeft: 12,
        height: 150,
    },
    advertisement: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    },
    adText: {
        fontSize: 25,
        fontWeight: '500',
        color: '#fffefeff',
        textAlign: 'center',
    },
    quickActionsSection: {
        margin: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionIcon: {
        fontSize: 24,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    featuresList: {
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureBullet: {
        fontSize: 16,
        color: '#007AFF',
        marginRight: 8,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
        lineHeight: 18,
    },
    verifyButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    securityInfoSection: {
        margin: 20,
        marginTop: 10,
    },
    securityInfoCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    securityInfoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 0,
        textAlign: 'center',
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    securityFeatureIcon: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    securityFeatureContent: {
        flex: 1,
    },
    securityFeatureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 0,
    },
    securityFeatureDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
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
    closeButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    placeholder: {
        width: 80,
    },
});

export default HomeScreen;