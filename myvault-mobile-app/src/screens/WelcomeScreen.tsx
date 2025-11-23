import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {RootStackParamList} from '../../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

type Props = {
    navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen:React.FC<Props> = ({navigation}) =>{

    // Function to navigate to SigninScreen
    const handleSignin = async () => {
        console.log('Navigating to SigninScreen');
        
        try {
            // Check if user has a valid token and security setup is complete
            const token = await AsyncStorage.getItem('authToken');
            const userData = await AsyncStorage.getItem('userData');
            const securitySetupComplete = await AsyncStorage.getItem('securitySetupComplete');

            // If user has valid token and security setup, show re-auth screen
            if (token && userData && securitySetupComplete === 'true') {
                console.log('✅ Valid token found - showing re-authentication screen');
                navigation.navigate('ReAuthenticate');
            } else {
                console.log('❌ No valid token - showing login screen');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('❌ Error checking token:', error);
            // Default to login screen on error
            navigation.navigate('Login');
        }
    };

    // Function to navigate to CreateAccountScreen
    const handleCreateAccount = () => {
        console.log('Navigating to CreateAccountScreen');
        navigation.navigate('CreateAccount'); // CreateAccount screen defined in your navigator
    };

    return (

        <SafeAreaView style = {styles.container}>
            <View style = {styles.content}>

                {/* app logo*/}
                <View style = {styles.logoContainer}>
                    <Image 
                        source = {require('../assets/images/logo.png')}
                        style = {styles.logo}
                        resizeMode = "contain"/>
                </View>

                {/* welcome text */}
                <Text style = {styles.welcomeTitle}>MyVault</Text>
                <Text style = {styles.subtitle}>Digital identity and document verification solution</Text>

                {/* Sign in button */}
                <TouchableOpacity style = {styles.signinButton}
                    onPress = {handleSignin}>
                        <Text style = {styles.signinText}>Sign in</Text>
                </TouchableOpacity>

                {/*Create MyVault Account button */}
                <TouchableOpacity style = {styles.signinButton}
                    onPress = {handleCreateAccount}>
                        <Text style = {styles.signinText}>Create MyVault Account</Text>
                </TouchableOpacity>


            </View>


        </SafeAreaView>

    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 100,
    },
    signinButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 4,
        marginBottom: 20,
        width: '80%',
    },
    signinText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },


});

export default WelcomeScreen;