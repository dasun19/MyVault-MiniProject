import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type AppHeaderProps = {
    title?: string;
};

const AppHeader: React.FC<AppHeaderProps> = ({ title = 'MyVault' }) => {
    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoContent}>
                <Image 
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode='contain'
                />
                <Text style={styles.myvaultTitle}>{title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default AppHeader;