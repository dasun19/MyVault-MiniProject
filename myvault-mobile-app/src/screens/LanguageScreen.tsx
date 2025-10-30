import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image,} from 'react-native';
import { SafeAreaView} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

// Define navigation prop type for LanguageScreen
type LanguageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Language'>;

//Props interface - this screen recieves navigation as a prop

type Props = {
    navigation: LanguageScreenNavigationProp;
}

const LanguageScreen: React.FC<Props> = ({navigation}) => {
       const [selectedLanguage, setSelectedLanguage] = useState('English');
       
       // Function to navigate to WelcomeScreen
       const handleLanguageSelect =  (language: string) => {
        // Update the selected language state
        setSelectedLanguage(language);
       
        console.log('Selected language:', language);

        // Navigate to WelcomeScreen
        navigation.navigate('Welcome');
       };

       return (
            <SafeAreaView style={styles.container}>
              <View style={styles.content}>

                {/*app icon*/}
                <View style={styles.iconContainer}>
                  <Image
                    source = {require('../assets/images/logo.png')}
                    style = {styles.logo}
                    resizeMode = "contain"/>
                </View>


                {/*welcome text*/}
                <Text style = {styles.welcomeTitle}>MyVault</Text>
                <Text style = {styles.subtitle}>Digital identity and document verification solution</Text>

                {/*language selection*/}
                <View style = {styles.languageSection}>

                <Text style = {styles.languageTitle}>Select a language</Text>

                <TouchableOpacity style = {styles.languageButton}
                onPress = {()=>handleLanguageSelect('English')}>
                    <Text style = {styles.languageText}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.languageButton}
                onPress = {()=>handleLanguageSelect('Sinhala')}>
                    <Text style = {styles.languageText}>සිංහල</Text>
                </TouchableOpacity>
                </View>

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

    iconContainer: {
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo:{
        width:150,
        height: 150,
    },

    document: {
        width: 40,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 80,
    },
    languageSection: {
        width: '100%',
        alignItems: 'center',
    },
    languageTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 20,
    },
    languageButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        minWidth: 120,
        marginBottom: 16,
    },
    languageText: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default LanguageScreen;