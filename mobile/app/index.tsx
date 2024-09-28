import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TailwindProvider } from 'tailwind-rn';
import utilities from './tailwind.json';
import Menu from '../components/Menu';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

export default function App() {
  return (
    <TailwindProvider utilities={utilities}>
      <SafeAreaProvider>
        <Stack.Navigator initialRouteName="Menu">
          <Stack.Screen 
            name="Menu" 
            component={Menu} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
        <Toast />
      </SafeAreaProvider>
    </TailwindProvider>
  );
}
