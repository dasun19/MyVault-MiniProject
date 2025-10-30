import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {RootStackParamList} from '../../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

type Props = {
    navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen:React.FC<Props> = ({navigation}) =>{

    // Function to navigate to SigninScreen
    const handleSignin = () => {
        console.log('Navigating to SigninScreen');
        navigation.navigate('Login'); // Assuming you have a Signin screen defined in your navigator

    };

    // Function to navigate to CreateAccountScreen
    const handleCreateAccount = () => {
        console.log('Navigating to CreateAccountScreen');
        navigation.navigate('CreateAccount'); // CreateAccount screen defined in your navigator
    };
    //Function to go back to LanguageScreen
    const goBackToLanguageScreen = () => {
        navigation.navigate('Language');
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