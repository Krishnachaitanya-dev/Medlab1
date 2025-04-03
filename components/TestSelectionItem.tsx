import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Test } from '@/types';

interface TestSelectionItemProps {
  test: Test;
  onToggle: () => void;
  isSelected: boolean;
}

export default function TestSelectionItem({ test, onToggle, isSelected }: TestSelectionItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.containerSelected]} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{test.name}</Text>
        <Text style={styles.category}>{test.category}</Text>
        <Text style={styles.price}>₹{test.price.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Check size={16} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});