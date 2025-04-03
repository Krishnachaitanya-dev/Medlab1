import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePatientStore } from '@/store/patient-store';
import { useTestStore } from '@/store/test-store';
import { useInvoiceStore } from '@/store/invoice-store';
import { useReportStore } from '@/store/report-store';
import FormField from '@/components/FormField';
import SelectField from '@/components/SelectField';
import Button from '@/components/Button';
import TestSelectionItem from '@/components/TestSelectionItem';
import TestSelectionModal from '@/components/TestSelectionModal';
import { Test } from '@/types';

export default function AddPatientScreen() {
  const router = useRouter();
  const { addPatient } = usePatientStore();
  const { tests, fetchTests } = useTestStore();
  const { addInvoice } = useInvoiceStore();
  const { addReport } = useReportStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testSelectionModalVisible, setTestSelectionModalVisible] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>('Pending');
  
  // Form validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Calculate total amount
  const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
  
  useEffect(() => {
    setIsLoading(true);
    fetchTests().finally(() => setIsLoading(false));
  }, []);
  
  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];
  
  const paymentMethodOptions = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'UPI', value: 'UPI' },
  ];
  
  const paymentStatusOptions = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Due', value: 'Due' },
  ];
  
  const handleAddTest = () => {
    setTestSelectionModalVisible(true);
  };
  
  const handleSelectTest = (test: Test) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    } else {
      Alert.alert('Error', 'This test is already added');
    }
  };
  
  const handleRemoveTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(test => test.id !== testId));
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age.trim()) newErrors.age = 'Age is required';
    if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!gender) newErrors.gender = 'Gender is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (selectedTests.length === 0) newErrors.tests = 'At least one test is required';
    if (!paymentStatus) newErrors.paymentStatus = 'Payment status is required';
    if (paymentStatus === 'Paid' && !paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required for paid invoices';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Add patient
      const newPatient = await addPatient({
        name,
        age: parseInt(age),
        gender: gender as 'Male' | 'Female' | 'Other',
        phone,
        address,
      });
      
      // Create invoice
      const newInvoice = await addInvoice({
        patientId: newPatient.id,
        tests: selectedTests.map(test => test.id),
        totalAmount,
        status: paymentStatus as 'Paid' | 'Pending' | 'Due',
        ...(paymentStatus === 'Paid' && { paymentMethod: paymentMethod as 'Cash' | 'Card' | 'UPI' }),
      });
      
      // Create reports for each test
      await Promise.all(selectedTests.map(test => 
        addReport({
          patientId: newPatient.id,
          testId: test.id,
          results: [],
          status: 'Pending',
        })
      ));
      
      Alert.alert(
        'Success',
        'Patient registered successfully',
        [
          {
            text: 'View Patient',
            onPress: () => router.push(`/patient/${newPatient.id}`),
          },
          {
            text: 'View Invoice',
            onPress: () => router.push(`/invoice/${newInvoice.id}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tests...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Add New Patient' }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            
            <FormField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter patient's full name"
              error={errors.name}
              required
            />
            
            <View style={styles.row}>
              <FormField
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                keyboardType="numeric"
                error={errors.age}
                containerStyle={styles.halfField}
                required
              />
              
              <SelectField
                label="Gender"
                value={gender}
                options={genderOptions}
                onSelect={(option) => setGender(option.value)}
                placeholder="Select gender"
                error={errors.gender}
                containerStyle={styles.halfField}
                required
              />
            </View>
            
            <FormField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />
            
            <FormField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
              error={errors.address}
              required
            />
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Test Selection</Text>
              <Button
                title="Add Test"
                onPress={handleAddTest}
                variant="primary"
                size="small"
              />
            </View>
            
            {errors.tests && (
              <Text style={styles.errorText}>{errors.tests}</Text>
            )}
            
            {selectedTests.length > 0 ? (
              <View style={styles.testsContainer}>
                {selectedTests.map(test => (
                  <TestSelectionItem
                    key={test.id}
                    test={test}
                    onRemove={() => handleRemoveTest(test.id)}
                  />
                ))}
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noTestsText}>
                No tests selected. Add tests using the button above.
              </Text>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <SelectField
              label="Payment Status"
              value={paymentStatus}
              options={paymentStatusOptions}
              onSelect={(option) => setPaymentStatus(option.value)}
              placeholder="Select payment status"
              error={errors.paymentStatus}
              required
            />
            
            {paymentStatus === 'Paid' && (
              <SelectField
                label="Payment Method"
                value={paymentMethod}
                options={paymentMethodOptions}
                onSelect={(option) => setPaymentMethod(option.value)}
                placeholder="Select payment method"
                error={errors.paymentMethod}
                required
              />
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Register Patient"
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <TestSelectionModal
        visible={testSelectionModalVisible}
        onClose={() => setTestSelectionModalVisible(false)}
        onSelect={handleSelectTest}
        tests={tests}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  testsContainer: {
    marginTop: 8,
  },
  noTestsText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 12,
  },
});