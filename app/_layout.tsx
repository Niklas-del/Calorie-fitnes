import { Redirect, Slot, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useProfileStore } from '../src/store/useProfileStore';
import { colors } from '../src/theme/theme';

export default function RootLayout() {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const profile = useProfileStore((s) => s.profile);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasHydrated) setReady(true);
  }, [hasHydrated]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        {ready && !profile && pathname !== '/onboarding' ? (
          <Redirect href="/onboarding" />
        ) : (
          <Slot />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
