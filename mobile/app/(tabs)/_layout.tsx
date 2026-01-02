import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 5,
          height: 80 + (insets.bottom || 15), // Taller height
          paddingBottom: (insets.bottom || 15) + 15, // Push icons significantly higher
          paddingTop: 15,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={24} color={color} />,
        }}
      />

      {/* Hide the 'explore' if it still exists or other files */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
