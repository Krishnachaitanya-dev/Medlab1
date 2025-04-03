import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import colors from '@/constants/colors';
import { TestParameter } from '@/types';

interface ResultInputItemProps {
  parameter: TestParameter;
  value: string;
  onValueChange: (value: string) => void;
}

export default function ResultInputItem({ 
  parameter, 
  value,
  onValueChange 
}: ResultInputItemProps) {
  const [isNormal, setIsNormal] = useState<boolean | null>(null);

  const checkIfNormal = (inputValue: string) => {
    if (!inputValue) return null;
    
    const numValue = parseFloat(inputValue);
    
    // Check if normal range contains a hyphen (range)
    if (parameter.normalRange.includes('-')) {
      const [min, max] = parameter.normalRange.split('-').map(v => parseFloat(v));
      return numValue >= min && numValue <= max;
    } 
    // Check if normal range is "less than" format
    else if (parameter.normalRange.includes('<')) {
      const max = parseFloat(parameter.normalRange.replace('<', ''));
      return numValue < max;
    } 
    // Check if normal range is "greater than" format
    else if (parameter.normalRange.includes('>')) {
      const min = parseFloat(parameter.normalRange.replace('>', ''));
      return numValue > min;
    }
    
    return null;
  };

  const handleValueChange = (text: string) => {
    onValueChange(text);
    setIsNormal(checkIfNormal(text));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.parameterName}>{parameter.name}</Text>
        <Text style={styles.normalRange}>
          Normal Range: {parameter.normalRange} {parameter.unit}
        </Text>
      </View>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isNormal === false && styles.abnormalInput,
            isNormal === true && styles.normalInput
          ]}
          value={value}
          onChangeText={handleValueChange}
          placeholder="Enter value"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
        <Text style={styles.unit}>{parameter.unit}</Text>
      </View>
      
      {isNormal !== null && (
        <Text style={[
          styles.resultStatus,
          isNormal ? styles.normalStatus : styles.abnormalStatus
        ]}>
          {isNormal ? 'Normal' : 'Abnormal'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: 12,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  normalRange: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  normalInput: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}10`,
  },
  abnormalInput: {
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}10`,
  },
  unit: {
    fontSize: 16,
    color: colors.textSecondary,
    width: 60,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  normalStatus: {
    color: colors.success,
    backgroundColor: `${colors.success}15`,
  },
  abnormalStatus: {
    color: colors.danger,
    backgroundColor: `${colors.danger}15`,
  },
});