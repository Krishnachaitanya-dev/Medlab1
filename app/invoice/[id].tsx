import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useInvoiceStore } from '@/store/invoice-store';
import { usePatientStore } from '@/store/patient-store';
import { useTestStore } from '@/store/test-store';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import HospitalHeader from '@/components/HospitalHeader';
import { Calendar, User, CreditCard, Printer, CheckCircle } from 'lucide-react-native';
import { generateInvoice } from '@/utils/print';
import { useHospitalStore } from '@/store/hospital-store';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getInvoiceById, updatePaymentStatus } = useInvoiceStore();
  const { getPatientById } = usePatientStore();
  const { getTestById } = useTestStore();
  const { details: hospitalDetails } = useHospitalStore();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  
  const invoice = getInvoiceById(id as string);
  
  if (!invoice) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Invoice not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  const patient = getPatientById(invoice.patientId);

  if (!patient) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Patient data not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  // Get test details for each test in the invoice
  const tests = invoice.tests.map(testId => getTestById(testId)).filter(Boolean);

  // Format date
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const handleMarkAsPaid = async () => {
    setIsUpdating(true);
    
    try {
      await updatePaymentStatus(invoice.id, 'Paid', selectedPaymentMethod);
      Alert.alert('Success', 'Invoice marked as paid');
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePrintInvoice = () => {
    if (Platform.OS === 'web') {
      setIsPrinting(true);
      try {
        // Prepare invoice data for printing
        const invoiceData = {
          id: invoice.id,
          date: invoice.createdAt,
          patientName: patient.name,
          patientId: patient.id,
          tests: tests.map(test => ({
            id: test?.id || '',
            name: test?.name || 'Unknown Test',
            price: test?.price || 0
          })),
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod,
          hospitalDetails: {
            name: hospitalDetails?.name || 'Medical Laboratory',
            address: hospitalDetails?.address || '',
            phone: hospitalDetails?.phone || '',
            email: hospitalDetails?.email || '',
            logo: hospitalDetails?.logo || '',
            tagline: hospitalDetails?.tagline || '',
            footer: hospitalDetails?.footer || 'Thank you for choosing our services.'
          }
        };
        
        generateInvoice(invoiceData);
      } catch (error) {
        console.error('Error printing invoice:', error);
        Alert.alert('Error', 'Failed to print invoice');
      } finally {
        setIsPrinting(false);
      }
    } else {
      Alert.alert('Print Invoice', 'This feature is only available on web.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: `Invoice #${invoice.id.replace('i', '')}`,
          headerTitle: `Invoice #${invoice.id.replace('i', '')}`,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                title="Print"
                onPress={handlePrintInvoice}
                variant="outline"
                size="small"
                style={styles.headerButton}
                loading={isPrinting}
                icon={<Printer size={16} color={colors.primary} />}
              />
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View id="invoice-content" style={styles.invoiceContent}>
          {/* Hospital Header */}
          <HospitalHeader showLabReport={false} />
          
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <StatusBadge status={invoice.status} size="medium" />
            </View>
            <Text style={styles.invoiceDate}>
              <Calendar size={14} color={colors.textSecondary} style={styles.iconInline} /> {formattedDate}
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Patient Information</Text>
            
            <View style={styles.infoRow}>
              <User size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{patient.name}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <User size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Patient ID</Text>
                <Text style={styles.infoValue}>{patient.id}</Text>
              </View>
            </View>
            
            {invoice.paymentMethod && (
              <View style={styles.infoRow}>
                <CreditCard size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>{invoice.paymentMethod}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tests</Text>
            
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.testNameCell]}>Test Description</Text>
              <Text style={[styles.tableHeaderCell, styles.testCodeCell]}>Code</Text>
              <Text style={[styles.tableHeaderCell, styles.priceCell]}>Price</Text>
            </View>
            
            {tests.map((test, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.testNameCell]}>{test?.name || 'Unknown Test'}</Text>
                <Text style={[styles.tableCell, styles.testCodeCell]}>{test?.id || ''}</Text>
                <Text style={[styles.tableCell, styles.priceCell]}>₹{test?.price.toFixed(2) || '0.00'}</Text>
              </View>
            ))}
            
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{invoice.totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelFinal}>Total:</Text>
                <Text style={styles.totalValueFinal}>₹{invoice.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{hospitalDetails?.footer || 'Thank you for choosing our services.'}</Text>
          </View>
        </View>
        
        {invoice.status !== 'Paid' && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Mark as Paid</Text>
            
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.paymentMethodLabel}>Payment Method:</Text>
              <View style={styles.paymentMethodOptions}>
                <Button
                  title="Cash"
                  onPress={() => setSelectedPaymentMethod('Cash')}
                  variant={selectedPaymentMethod === 'Cash' ? 'primary' : 'outline'}
                  size="small"
                  style={styles.paymentMethodButton}
                />
                <Button
                  title="Card"
                  onPress={() => setSelectedPaymentMethod('Card')}
                  variant={selectedPaymentMethod === 'Card' ? 'primary' : 'outline'}
                  size="small"
                  style={styles.paymentMethodButton}
                />
                <Button
                  title="UPI"
                  onPress={() => setSelectedPaymentMethod('UPI')}
                  variant={selectedPaymentMethod === 'UPI' ? 'primary' : 'outline'}
                  size="small"
                  style={styles.paymentMethodButton}
                />
              </View>
            </View>
            
            <Button
              title="Mark as Paid"
              onPress={handleMarkAsPaid}
              loading={isUpdating}
              style={styles.markAsPaidButton}
              icon={<CheckCircle size={18} color="#FFFFFF" />}
            />
          </View>
        )}
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
  invoiceContent: {
    // This is the container that will be printed
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  invoiceDate: {
    fontSize: 14,
    color: colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInline: {
    marginRight: 4,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 8,
    borderColor: colors.primary,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    fontSize: 14,
    color: colors.text,
  },
  testNameCell: {
    flex: 3,
  },
  testCodeCell: {
    flex: 1,
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 100,
    textAlign: 'right',
    marginRight: 16,
  },
  totalValue: {
    fontSize: 14,
    color: colors.text,
    width: 100,
    textAlign: 'right',
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    width: 100,
    textAlign: 'right',
    marginRight: 16,
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    width: 100,
    textAlign: 'right',
  },
  footer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  paymentSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  paymentMethodContainer: {
    marginBottom: 16,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
  },
  paymentMethodButton: {
    marginRight: 8,
    minWidth: 80,
  },
  markAsPaidButton: {
    width: '100%',
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