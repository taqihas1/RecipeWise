import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  containerClassName?: string;
}

export function ScreenContainer({ children, scrollable, containerClassName }: ScreenContainerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      paddingTop: insets.top + (Platform.OS === 'web' ? 16 : 8),
      paddingBottom: insets.bottom + 16,
      paddingHorizontal: 16,
    },
  ];

  if (scrollable) {
    return (
      <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
