import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
  },
});
