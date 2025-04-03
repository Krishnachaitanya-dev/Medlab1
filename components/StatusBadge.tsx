import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

type StatusType = 'Pending' | 'Completed' | 'Paid' | 'Due' | 'Processing';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return colors.success;
      case 'Pending':
      case 'Processing':
        return colors.warning;
      case 'Due':
        return colors.danger;
      default:
        return colors.textLight;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
          text: { fontSize: 10 }
        };
      case 'large':
        return {
          container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
          text: { fontSize: 14 }
        };
      default:
        return {
          container: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
          text: { fontSize: 12 }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();

  return (
    <View style={[
      styles.container, 
      sizeStyles.container, 
      { backgroundColor: `${statusColor}20`, borderColor: statusColor }
    ]}>
      <Text style={[styles.text, sizeStyles.text, { color: statusColor }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});