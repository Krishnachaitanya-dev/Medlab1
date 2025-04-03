import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePatientStore } from '@/store/patient-store';
import { useReportStore } from '@/store/report-store';
import { useInvoiceStore } from '@/store/invoice-store';
import Button from '@/components/Button';
import { User, Phone, MapPin, Calendar, FileText, Receipt, Plus, Edit, Trash2 } from 'lucide-react-native';
import ReportCard from '@/components/ReportCard';
import InvoiceCard from '@/components/InvoiceCard';
import TestSelectionModal from '@/components/TestSelectionModal';
import HospitalHeader from '@/components/HospitalHeader';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getPatientById, deletePatient } = usePatientStore();
  const { reports, getReportsByPatientId } = useReportStore();
  const { invoices, getInvoicesByPatientId } = useInvoiceStore();
  
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'invoices'>('reports');
  
  const patient = getPatientById(id as string);
  
  // Get patient reports and invoices
  const patientReports = patient ? getReportsByPatientId(patient.id) : [];
  const patientInvoices = patient ? getInvoicesByPatientId(patient.id) : [];
  
  if (!patient) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Patient not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }
  
  // Format date
  const formattedDate = new Date(patient.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const handleDeletePatient = () => {
    Alert.alert(
      'Delete Patient',
      'Are you sure you want to delete this patient? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deletePatient(patient.id);
            router.replace('/(tabs)/patients');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleAddTest = () => {
    setIsTestModalVisible(true);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: patient.name,
          headerTitle: patient.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => Alert.alert('Edit Patient', 'This feature would allow editing patient details.')}
              >
                <Edit size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDeletePatient}
              >
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hospital Header (Compact version) */}
        <HospitalHeader compact />
        
        <View style={styles.card}>
          <View style={styles.patientHeader}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientDetail}>
                {patient.age} years, {patient.gender}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Phone size={18} color={colors.textSecondary} />
              <Text style={styles.detailText}>{patient.phone}</Text>
            </View>
            
            {patient.address && (
              <View style={styles.detailRow}>
                <MapPin size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{patient.address}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={styles.detailText}>Registered on {formattedDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
            onPress={() => setActiveTab('reports')}
          >
            <FileText size={18} color={activeTab === 'reports' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
              Reports ({patientReports.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
            onPress={() => setActiveTab('invoices')}
          >
            <Receipt size={18} color={activeTab === 'invoices' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
              Invoices ({patientInvoices.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'reports' && (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Test Reports</Text>
              <Button
                title="Add Test"
                onPress={handleAddTest}
                variant="outline"
                size="small"
                icon={<Plus size={16} color={colors.primary} />}
              />
            </View>
            
            {patientReports.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={40} color={colors.textLight} />
                <Text style={styles.emptyStateText}>No reports found</Text>
                <Text style={styles.emptyStateSubtext}>Add a test to generate reports</Text>
              </View>
            ) : (
              patientReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => router.push(`/report/${report.id}`)}
                />
              ))
            )}
          </View>
        )}
        
        {activeTab === 'invoices' && (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Invoices</Text>
            </View>
            
            {patientInvoices.length === 0 ? (
              <View style={styles.emptyState}>
                <Receipt size={40} color={colors.textLight} />
                <Text style={styles.emptyStateText}>No invoices found</Text>
                <Text style={styles.emptyStateSubtext}>Add a test to generate an invoice</Text>
              </View>
            ) : (
              patientInvoices.map(invoice => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPress={() => router.push(`/invoice/${invoice.id}`)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
      
      <TestSelectionModal
        visible={isTestModalVisible}
        onClose={() => setIsTestModalVisible(false)}
        patientId={patient.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
});