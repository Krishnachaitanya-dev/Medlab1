import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Test } from '@/types';
import { ChevronRight, Microscope } from 'lucide-react-native';
import colors from '@/constants/colors';

interface TestCardProps {
  test: Test;
  onPress?: () => void;
}

export default function TestCard({ test, onPress }: TestCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Microscope size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{test.name}</Text>
        <Text style={styles.category}>{test.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.parameters}>
            {test.parameters.length} parameter{test.parameters.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.price}>₹{test.price.toFixed(2)}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  parameters: {
    fontSize: 12,
    color: colors.textLight,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});