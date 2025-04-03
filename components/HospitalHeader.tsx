import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useHospitalStore } from '@/store/hospital-store';
import colors from '@/constants/colors';
import { Microscope } from 'lucide-react-native';

interface HospitalHeaderProps {
  compact?: boolean;
  showLogo?: boolean;
  showLabReport?: boolean;
}

export default function HospitalHeader({ compact = false, showLogo = true, showLabReport = true }: HospitalHeaderProps) {
  const { details } = useHospitalStore();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showLabReport ? (
        <>
          <View style={styles.labIconContainer}>
            <Microscope size={32} color={colors.white} />
          </View>
          
          <View style={styles.labReportContainer}>
            <Text style={styles.labReportText}>Lab Report</Text>
          </View>
          
          {showLogo && details.logo && (
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: details.logo }} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
          )}
        </>
      ) : (
        <>
          {showLogo && details.logo && (
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: details.logo }} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.infoContainer}>
            <Text style={styles.hospitalName}>{details.name}</Text>
            
            {!compact && details.address && (
              <Text style={styles.address}>{details.address}</Text>
            )}
            
            <View style={styles.contactRow}>
              {details.phone && (
                <Text style={styles.contactText}>
                  Phone: {details.phone}
                  {details.email ? ` | Email: ${details.email}` : ''}
                  {details.website && !compact ? ` | Website: ${details.website}` : ''}
                </Text>
              )}
            </View>
            
            {!compact && details.registrationNumber && (
              <Text style={styles.registrationText}>
                Reg. No: {details.registrationNumber}
                {details.taxId ? ` | ${details.taxId}` : ''}
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  compactContainer: {
    padding: 8,
    marginBottom: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contactRow: {
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  registrationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  labIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  labReportContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labReportText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
});