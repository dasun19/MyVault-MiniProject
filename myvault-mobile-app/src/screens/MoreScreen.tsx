import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App.tsx';

type MoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const MoreScreen = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();

  // Menu options
  const options = [
    { id: '1', title: 'Profile', screen: 'Profile' },
    { id: '2', title: 'Settings', screen: 'Settings' },
    { id: '3', title: 'Help & Support', screen: 'Help' },
    { id: '4', title: 'About', screen: 'About' },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Text style={styles.optionText}>{item.title}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.pageContainer} >
      <ScrollView showsVerticalScrollIndicator={false} >
    <AppHeader/>
    <View style={styles.container}>
      

      {options.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={styles.optionText}>{item.title}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
              
              {/* Add separator between items (but not after the last item) */}
              {index < options.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
    </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  pageContainer:{
    flex:1,
    backgroundColor:'#f8fafc',
   
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
  separator: {
    height: 10,
  },
});
