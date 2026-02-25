/**
 * App.tsx - COMPLETE VERSION
 * All screens including Interactive Coaching
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import NicheSelectionScreen from './src/screens/NicheSelectionScreen';
import VideoUploadScreen from './src/screens/VideoUploadScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import CoachingScreen from './src/screens/CoachingScreen';
import InteractiveCoachingScreen from './src/screens/InteractiveCoachingScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
          
          <Stack.Screen 
            name="NicheSelection" 
            component={NicheSelectionScreen}
          />
          
          <Stack.Screen 
            name="VideoUpload" 
            component={VideoUploadScreen}
          />
          
          <Stack.Screen 
            name="Analysis" 
            component={AnalysisScreen}
          />
          
          <Stack.Screen 
            name="Coaching" 
            component={CoachingScreen}
          />
          
          {/* NEW: Interactive timestamp-based coaching */}
          <Stack.Screen 
            name="InteractiveCoaching" 
            component={InteractiveCoachingScreen}
          />
          
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
