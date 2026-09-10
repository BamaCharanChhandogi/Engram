import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const tabHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgSurface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding - 4,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Feather name="code" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          title: 'Prompts',
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: 'Retention',
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
