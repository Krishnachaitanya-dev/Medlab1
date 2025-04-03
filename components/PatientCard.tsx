import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Patient } from '@/types';
import { User, Phone, MapPin, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

interface PatientCardProps {
  patient: Patient;
  onPress?: () => void;
}

export default function PatientCard({ patient, onPress }: PatientCardProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{patient.name}</Text>
        <View style={styles.infoRow}>
          <User size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {patient.age} years, {patient.gender}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{patient.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{patient.address}</Text>
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
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
});