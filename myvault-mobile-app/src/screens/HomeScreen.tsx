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
import JWTVerifier from '../components/JWTVerifier';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen:React.FC<Props> = ({ navigation }) => {

    // Add state for JWT verifier modal
    const [showJWTVerifier, setShowJWTVerifier] = useState(false);
    //Add animated states
    const [ fadeAnim ] = useState(new Animated.Value(1));
    const [ showFirstAd, setShowFirstAd ] = useState(true); 
      
    // Add useEffect for animation
    useEffect (() => {
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
        }, 5000); // Swap every 3 seconds

        return () => clearInterval(interval);
    }, [fadeAnim]);

    return (
        <SafeAreaView style = {styles.container} >
            <ScrollView showsVerticalScrollIndicator={false}>

            <View style = { styles.logoContainer }>
                <View style = {styles.logoContent}>
                <Image 
                    source = {require('../assets/images/logo.png')}
                    style = {styles.logo}
                    resizeMode = 'contain'/>
                <Text style = {styles.myvaultTitle}>MyVault</Text>
                </View>
                
            </View>

            <View style={styles.advertisements}>
            <Animated.View style={[styles.advertisement, { opacity: fadeAnim }]}>
                <Text style={styles.adText}>
                        {showFirstAd
                         ? 'Your documents, anytime, anywhere'
                         : 'Share and verify your documents securely'}
                </Text>
            </Animated.View>
            </View>

       {/* Quick Actions Section */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    
                    <View style={styles.actionsGrid}>
                        {/* Navigate to Documents */}
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Document')}
                        >
                            <View style={styles.actionIconContainer}>
                                <Text style={styles.actionIcon}>📄</Text>
                            </View>
                            <Text style={styles.actionTitle}>My Documents</Text>
                            <Text style={styles.actionSubtitle}>
                                View and manage your documents
                            </Text>
                        </TouchableOpacity>

                        {/* JWT Verification */}
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => setShowJWTVerifier(true)}
                        >
                            <View style={styles.actionIconContainer}>
                                <Text style={styles.actionIcon}>🔍</Text>
                            </View>
                            <Text style={styles.actionTitle}>Verify Documents</Text>
                            <Text style={styles.actionSubtitle}>
                                Scan or verify hashes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Verification Section */}
                <View style={styles.verificationSection}>
                    <Text style={styles.sectionTitle}>Document Verification</Text>
                    
                    <View style={styles.verificationCard}>
                        <View style={styles.verificationHeader}>
                            <View style={styles.securityIconContainer}>
                                <Text style={styles.securityIcon}>🔐</Text>
                            </View>
                            <View style={styles.verificationContent}>
                                <Text style={styles.verificationTitle}>Secure Blockchain Verification</Text>
                                <Text style={styles.verificationSubtitle}>
                                    Verify the authenticity of shared documents
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Text style={styles.featureBullet}>•</Text>
                                <Text style={styles.featureText}>
                                    Scan QR codes
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Text style={styles.featureBullet}>•</Text>
                                <Text style={styles.featureText}>
                                    Verify hashes through blockchain
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Text style={styles.featureBullet}>•</Text>
                                <Text style={styles.featureText}>
                                    Check token expiration status
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Text style={styles.featureBullet}>•</Text>
                                <Text style={styles.featureText}>
                                    View verified document data securely
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.verifyButton}
                            onPress={() => setShowJWTVerifier(true)}
                        >
                            <Text style={styles.verifyButtonText}>Start Verification</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security Information Section */}
                <View style={styles.securityInfoSection}>
                    <Text style={styles.sectionTitle}>Key Features of MyVault</Text>
                    
                    <View style={styles.securityInfoCard}>
                        <Text style={styles.securityInfoTitle}></Text>
                        
                        <View style={styles.securityFeature}>
                            <Text style={styles.securityFeatureIcon}>🔒</Text>
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>Your Identity, Your Control</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    Keep all your credentials safely on your own device — no central servers, no third-party access.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.securityFeature}>
                            <Text style={styles.securityFeatureIcon}>🔗</Text>
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>Verified by Blockchain</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    Ensure authenticity and tamper-proof verification.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.securityFeature}>
                            <Text style={styles.securityFeatureIcon}>🔁</Text>
                            <View style={styles.securityFeatureContent}>
                                <Text style={styles.securityFeatureTitle}>Encrypted QR Code Sharing</Text>
                                <Text style={styles.securityFeatureDesc}>
                                    Securely share your identity or documents using encrypted QR codes.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Verifier Modal */}
            <Modal
                visible={showJWTVerifier}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setShowJWTVerifier(false)}
                        >
                            <Text style={styles.closeButtonText}>✕ Close</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}></Text>
                        <View style={styles.placeholder} />
                    </View>
                    
                    <JWTVerifier onClose={() => setShowJWTVerifier(false)} />
                </View>
            </Modal>
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
  advertisement: { // Add this new style
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
    verificationSection: {
        margin: 20,
        marginTop: 10,
    },
    verificationCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#e3f2fd',
    },
    verificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    securityIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    securityIcon: {
        fontSize: 24,
    },
    verificationContent: {
        flex: 1,
    },
    verificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    verificationSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
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
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
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