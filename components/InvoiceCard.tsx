import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Invoice } from '@/types';
import { ChevronRight, Receipt } from 'lucide-react-native';
import colors from '@/constants/colors';
import StatusBadge from './StatusBadge';
import { usePatientStore } from '@/store/patient-store';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

export default function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const { getPatientById } = usePatientStore();
  const patient = getPatientById(invoice.patientId);
  
  // Format date
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
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
        <Receipt size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.invoiceId}>Invoice #{invoice.id.replace('i', '')}</Text>
          <StatusBadge status={invoice.status} />
        </View>
        <Text style={styles.patientName}>
          {patient?.name || 'Unknown Patient'}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.amount}>₹{invoice.totalAmount.toFixed(2)}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  patientName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});