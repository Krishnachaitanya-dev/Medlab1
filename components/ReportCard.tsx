import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Report } from '@/types';
import { ChevronRight, FileText } from 'lucide-react-native';
import colors from '@/constants/colors';
import StatusBadge from './StatusBadge';
import { usePatientStore } from '@/store/patient-store';
import { useTestStore } from '@/store/test-store';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
}

export default function ReportCard({ report, onPress }: ReportCardProps) {
  const { getPatientById } = usePatientStore();
  const { getTestById } = useTestStore();
  
  const patient = getPatientById(report.patientId);
  const test = getTestById(report.testId);
  
  // Format date
  const formattedDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <FileText size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.testName} numberOfLines={1}>
            {test?.name || 'Unknown Test'}
          </Text>
          <StatusBadge status={report.status} />
        </View>
        <Text style={styles.patientName}>
          {patient?.name || 'Unknown Patient'}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  patientName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
});