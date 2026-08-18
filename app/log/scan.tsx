import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { FoodConfirm } from '../../src/components/FoodConfirm';
import { FoodItem, MealType } from '../../src/lib/types';
import { lookupFoodByBarcode } from '../../src/services/openFoodFacts';
import { useFoodLogStore } from '../../src/store/useFoodLogStore';
import { colors, spacing, typography } from '../../src/theme/theme';

export default function ScanBarcode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<FoodItem | null>(null);
  const addEntry = useFoodLogStore((s) => s.addEntry);

  async function handleScan(barcode: string) {
    if (locked) return;
    setLocked(true);
    setLoading(true);
    setError(null);
    try {
      const item = await lookupFoodByBarcode(barcode);
      if (!item) {
        setError(`No product found for barcode ${barcode}.`);
      } else {
        setFound(item);
      }
    } catch {
      setError('Lookup failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function save(grams: number, meal: MealType) {
    if (!found) return;
    addEntry(found, grams, meal);
    router.back();
  }

  function reset() {
    setFound(null);
    setError(null);
    setLocked(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={typography.h1}>Scan barcode</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      {!permission ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(8) }} />
      ) : !permission.granted ? (
        <View style={styles.permissionBox}>
          <Text style={[typography.body, { textAlign: 'center', marginBottom: spacing(4) }]}>
            Camera access is needed to scan barcodes.
          </Text>
          <Button title="Grant camera access" onPress={requestPermission} />
        </View>
      ) : found ? (
        <View style={{ marginTop: spacing(4) }}>
          <FoodConfirm food={found} onSave={save} />
          <Pressable onPress={reset} style={{ marginTop: spacing(4) }}>
            <Text style={styles.rescanText}>Scan another item</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
            }}
            onBarcodeScanned={(result) => handleScan(result.data)}
          />
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame} />
            <Text style={styles.hint}>Align the barcode within the frame</Text>
          </View>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : null}
          {error ? (
            <View style={styles.errorBar}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={reset}>
                <Text style={styles.rescanText}>Try again</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(5) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(6) },
  cameraWrap: { flex: 1, marginTop: spacing(4), borderRadius: 20, overflow: 'hidden' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
  },
  hint: { color: '#fff', marginTop: spacing(4), fontSize: 13 },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBar: {
    position: 'absolute',
    bottom: spacing(6),
    left: spacing(4),
    right: spacing(4),
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing(4),
    alignItems: 'center',
  },
  errorText: { color: colors.text, textAlign: 'center', marginBottom: spacing(2) },
  rescanText: { color: colors.primary, fontWeight: '700' },
});
