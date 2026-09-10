import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../constants/Theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Feather.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" backgroundColor={Colors.bgPrimary} />
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
        <StatusBar style="light" backgroundColor={Colors.bgPrimary} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bgPrimary },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

