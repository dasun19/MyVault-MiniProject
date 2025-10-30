import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import DocumentScreen from '../screens/DocumentScreen';
import MoreScreen from '../screens/MoreScreen';
import { RouteProp } from '@react-navigation/native';
import { Image } from 'react-native';

type TabParamList = {
    Home: undefined;
    'My Documents': undefined;
    More: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const Colors = {
    primary: '#007bff',
    inactive: 'gray',
};

const BottomTabs = () => {
  const screenOptions = useMemo(
    () =>
      ({ route }: { route: RouteProp<TabParamList> }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarLabel: route.name,
        tabBarStyle: {
            height: 75,
            paddignBottom: 5,
            paddingTop:10,

        },
        tabBarLabelStyle: {
            fontSize: 14,
            
        
        },
        accessibilityLabel: `${route.name} tab`,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const iconMap: Record<string, any> = {
            Home: require('../assets/images/home.png'),
            'My Documents': require('../assets/images/document.png'),
            More: require('../assets/images/more.png'),
          };
          return (<Image
                    source = {iconMap[route.name]}
                    style = {{
                        width: 28,
                        height: 28,
                        tintColor: color
                    }}
                    />
          );
        },
      }),
    []
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Documents" component={DocumentScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;