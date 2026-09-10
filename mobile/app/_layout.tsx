import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../constants/Theme';

export default function RootLayout() {
  return (
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
  );
}
