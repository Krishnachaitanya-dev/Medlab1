import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { TextInput } from 'react-native';
import colors from '@/constants/colors';

// Fix for TextInput in React Native Web
if (Platform.OS === 'web') {
  // @ts-ignore - This is a workaround for a React Native Web issue
  TextInput.defaultProps = TextInput.defaultProps || {};
  // @ts-ignore
  TextInput.defaultProps.autoComplete = 'off';
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        // Hide folder names from appearing in the header
        headerTitle: "",
      }}
    />
  );
}