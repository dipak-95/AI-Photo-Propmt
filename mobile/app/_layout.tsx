import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Import our custom context
import { ThemeProvider as CustomThemeProvider, useTheme } from '../context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  // Now we can use our custom hook because this component is inside the provider
  const { theme } = useTheme();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="settings/privacy" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings/howto" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings/theme" options={{ presentation: 'card' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/CustomSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

import { useRef, useCallback } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function MainLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Load resources here if needed
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide the native splash screen immediately when the root view is laid out
      await SplashScreen.hideAsync();

      // Keep the custom splash screen visible for 2 seconds, then fade it out
      setTimeout(() => {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 800, // Smooth fade out duration
          useNativeDriver: true,
        }).start(() => setSplashAnimationFinished(true));
      }, 2000);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <RootLayoutNav />
      {!splashAnimationFinished && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: splashOpacity, zIndex: 1000 }]}>
          <CustomSplashScreen />
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <MainLayout />
    </CustomThemeProvider>
  );
}
