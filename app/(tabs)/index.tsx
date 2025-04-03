import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePatientStore } from '@/store/patient-store';
import { useReportStore } from '@/store/report-store';
import { useInvoiceStore } from '@/store/invoice-store';
import { useAuthStore } from '@/store/auth-store';
import StatCard from '@/components/StatCard';
import PatientCard from '@/components/PatientCard';
import ReportCard from '@/components/ReportCard';
import InvoiceCard from '@/components/InvoiceCard';
import { Users, FileText, Receipt, AlertCircle } from 'lucide-react-native';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { reports, getPendingReports, fetchReports } = useReportStore();
  const { invoices, getPendingInvoices, fetchInvoices } = useInvoiceStore();

  const pendingReports = getPendingReports();
  const pendingInvoices = getPendingInvoices();
  const recentPatients = [...patients].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  useEffect(() => {
    fetchPatients();
    fetchReports();
    fetchInvoices();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPatients(),
      fetchReports(),
      fetchInvoices(),
    ]);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <StatCard
                title="Total Patients"
                value={patients.length}
                icon={<Users size={24} color={colors.primary} />}
                color={colors.primary}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Pending Reports"
                value={pendingReports.length}
                icon={<FileText size={24} color={colors.warning} />}
                color={colors.warning}
              />
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <StatCard
                title="Pending Payments"
                value={pendingInvoices.length}
                icon={<Receipt size={24} color={colors.danger} />}
                color={colors.danger}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Completed Tests"
                value={reports.filter(r => r.status === 'Completed').length}
                icon={<AlertCircle size={24} color={colors.success} />}
                color={colors.success}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Patients</Text>
            <Text 
              style={styles.seeAll}
              onPress={() => router.push('/patients')}
            >
              See All
            </Text>
          </View>
          {recentPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPress={() => router.push(`/patient/${patient.id}`)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Reports</Text>
            <Text 
              style={styles.seeAll}
              onPress={() => router.push('/reports')}
            >
              See All
            </Text>
          </View>
          {pendingReports.slice(0, 3).map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => router.push(`/report/${report.id}`)}
            />
          ))}
          {pendingReports.length === 0 && (
            <Text style={styles.emptyText}>No pending reports</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Payments</Text>
            <Text 
              style={styles.seeAll}
              onPress={() => router.push('/invoices')}
            >
              See All
            </Text>
          </View>
          {pendingInvoices.slice(0, 3).map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onPress={() => router.push(`/invoice/${invoice.id}`)}
            />
          ))}
          {pendingInvoices.length === 0 && (
            <Text style={styles.emptyText}>No pending payments</Text>
          )}
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    padding: 16,
  },
});