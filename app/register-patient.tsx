import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity
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
import DatePicker from '@/components/DatePicker';
import TestSelectionTable from '@/components/TestSelectionTable';
import { Test } from '@/types';
import { Calendar, Save, X } from 'lucide-react-native';

export default function RegisterPatientScreen() {
  const router = useRouter();
  const { addPatient } = usePatientStore();
  const { tests, fetchTests } = useTestStore();
  const { addInvoice } = useInvoiceStore();
  const { addReport } = useReportStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate slip number and patient ID
  const slipNo = `SL${Date.now().toString().slice(-6)}`;
  const patientId = `P${Date.now().toString().slice(-6)}`;
  
  // Form state - Patient Information
  const [regDate, setRegDate] = useState(new Date());
  const [title, setTitle] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');
  const [referredBy, setReferredBy] = useState('');
  
  // Form state - Test Selection
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  
  // Form state - Payment Information
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<string | null>('Cash');
  const [amountPaid, setAmountPaid] = useState('0');
  const [balanceAmount, setBalanceAmount] = useState(0);
  
  // Form state - Additional Information
  const [remarks, setRemarks] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Fetch tests on component mount
  useEffect(() => {
    setIsLoading(true);
    fetchTests().finally(() => setIsLoading(false));
  }, []);
  
  // Calculate payment values when relevant fields change
  useEffect(() => {
    // Calculate total amount from selected tests
    const calculatedTotal = selectedTests.reduce((sum, test) => sum + test.price, 0);
    setTotalAmount(calculatedTotal);
    
    // Calculate discount amount
    const discount = parseFloat(discountPercent) || 0;
    const discountAmt = (calculatedTotal * discount) / 100;
    setDiscountAmount(discountAmt);
    
    // Calculate net amount
    const net = calculatedTotal - discountAmt;
    setNetAmount(net);
    
    // Calculate balance
    const paid = parseFloat(amountPaid) || 0;
    setBalanceAmount(net - paid);
  }, [selectedTests, discountPercent, amountPaid]);
  
  const titleOptions = [
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Ms.', value: 'Ms.' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Prof.', value: 'Prof.' },
  ];
  
  const packageOptions = [
    { label: 'Basic Health Checkup', value: 'basic' },
    { label: 'Comprehensive Health Checkup', value: 'comprehensive' },
    { label: 'Diabetes Checkup', value: 'diabetes' },
    { label: 'Cardiac Checkup', value: 'cardiac' },
    { label: "Women's Health Checkup", value: 'women' },
  ];
  
  const paymentModeOptions = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Card', value: 'Card' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Net Banking', value: 'Net Banking' },
    { label: 'Cheque', value: 'Cheque' },
  ];
  
  const handleAddTest = (test: Test) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    } else {
      Alert.alert('Error', 'This test is already added');
    }
  };
  
  const handleRemoveTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(test => test.id !== testId));
  };
  
  const handleSelectPackage = (packageValue: string) => {
    setSelectedPackage(packageValue);
    
    // Add package tests based on selection
    let packageTests: Test[] = [];
    
    switch(packageValue) {
      case 'basic':
        packageTests = tests.filter(t => ['t1', 't3'].includes(t.id));
        break;
      case 'comprehensive':
        packageTests = tests.filter(t => ['t1', 't2', 't3', 't4'].includes(t.id));
        break;
      case 'diabetes':
        packageTests = tests.filter(t => ['t3', 't4'].includes(t.id));
        break;
      case 'cardiac':
        packageTests = tests.filter(t => ['t1', 't2', 't4'].includes(t.id));
        break;
      case 'women':
        packageTests = tests.filter(t => ['t1', 't2', 't5'].includes(t.id));
        break;
    }
    
    // Add package tests to selected tests (avoiding duplicates)
    const newTests = [...selectedTests];
    packageTests.forEach(test => {
      if (!newTests.some(t => t.id === test.id)) {
        newTests.push(test);
      }
    });
    
    setSelectedTests(newTests);
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate patient information
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (mobile.trim() && !/^[0-9]{10}$/.test(mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!age.trim()) newErrors.age = 'Age is required';
    if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    
    // Validate test selection
    if (selectedTests.length === 0) {
      newErrors.tests = 'At least one test must be selected';
    }
    
    // Validate payment information
    if (parseFloat(amountPaid) < 0) {
      newErrors.amountPaid = 'Amount paid cannot be negative';
    }
    if (parseFloat(amountPaid) > netAmount) {
      newErrors.amountPaid = 'Amount paid cannot exceed net amount';
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
        name: title ? `${title} ${fullName}` : fullName,
        age: parseInt(age),
        gender: sex,
        phone: mobile,
        address: address,
      });
      
      // Determine payment status
      let paymentStatus: 'Paid' | 'Pending' | 'Due' = 'Pending';
      if (parseFloat(amountPaid) >= netAmount) {
        paymentStatus = 'Paid';
      } else if (parseFloat(amountPaid) > 0) {
        paymentStatus = 'Due';
      }
      
      // Create invoice
      const newInvoice = await addInvoice({
        patientId: newPatient.id,
        tests: selectedTests.map(test => test.id),
        totalAmount: netAmount,
        status: paymentStatus,
        paymentMethod: paymentStatus === 'Paid' ? paymentMode as 'Cash' | 'Card' | 'UPI' : undefined,
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
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Register Patient',
          headerTitle: 'Register Patient'
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Information */}
          <View style={styles.headerSection}>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Reg. Date</Text>
              <DatePicker
                date={regDate}
                onDateChange={setRegDate}
                style={styles.datePicker}
              />
            </View>
            
            <View style={styles.headerCenter}>
              <View style={styles.headerItem}>
                <Text style={styles.headerLabel}>Slip No.</Text>
                <Text style={styles.headerValue}>{slipNo}</Text>
              </View>
              
              <View style={styles.headerItem}>
                <Text style={styles.headerLabel}>Patient ID</Text>
                <Text style={styles.headerValue}>{patientId}</Text>
              </View>
            </View>
            
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Ref. By</Text>
              <FormField
                label=""
                value={referredBy}
                onChangeText={setReferredBy}
                placeholder="Doctor name"
                containerStyle={styles.noMargin}
              />
            </View>
          </View>
          
          {/* Patient Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            
            <View style={styles.row}>
              <SelectField
                label="Title"
                value={title}
                options={titleOptions}
                onSelect={(option) => setTitle(option.value)}
                placeholder="Select"
                containerStyle={styles.titleField}
              />
              
              <FormField
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter patient's full name"
                error={errors.fullName}
                containerStyle={styles.nameField}
                required
              />
              
              <FormField
                label="Mobile"
                value={mobile}
                onChangeText={setMobile}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                error={errors.mobile}
                containerStyle={styles.mobileField}
                required
              />
              
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                error={errors.email}
                containerStyle={styles.emailField}
              />
            </View>
            
            <View style={styles.row}>
              <FormField
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                keyboardType="numeric"
                error={errors.age}
                containerStyle={styles.ageField}
                required
              />
              
              <View style={styles.sexField}>
                <Text style={styles.fieldLabel}>Sex</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[styles.radioButton, sex === 'Male' && styles.radioSelected]}
                    onPress={() => setSex('Male')}
                  >
                    <View style={styles.radioInner}>
                      {sex === 'Male' && <View style={styles.radioSelectedDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Male</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioButton, sex === 'Female' && styles.radioSelected]}
                    onPress={() => setSex('Female')}
                  >
                    <View style={styles.radioInner}>
                      {sex === 'Female' && <View style={styles.radioSelectedDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Female</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioButton, sex === 'Other' && styles.radioSelected]}
                    onPress={() => setSex('Other')}
                  >
                    <View style={styles.radioInner}>
                      {sex === 'Other' && <View style={styles.radioSelectedDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Other</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <FormField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter complete address"
              multiline
              numberOfLines={2}
            />
          </View>
          
          {/* Test Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Test Selection</Text>
            
            <View style={styles.row}>
              <SelectField
                label="Select Package (Optional)"
                value={selectedPackage}
                options={packageOptions}
                onSelect={(option) => handleSelectPackage(option.value)}
                placeholder="Select a package"
                containerStyle={styles.packageField}
              />
            </View>
            
            {errors.tests && (
              <Text style={styles.errorText}>{errors.tests}</Text>
            )}
            
            <TestSelectionTable
              selectedTests={selectedTests}
              onRemoveTest={handleRemoveTest}
              onAddTest={handleAddTest}
              availableTests={tests}
            />
          </View>
          
          {/* Payment Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <View style={styles.row}>
              <View style={styles.paymentField}>
                <Text style={styles.fieldLabel}>Total Amount</Text>
                <Text style={styles.paymentValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
              
              <FormField
                label="Discount (%)"
                value={discountPercent}
                onChangeText={setDiscountPercent}
                placeholder="0"
                keyboardType="numeric"
                containerStyle={styles.paymentField}
              />
              
              <View style={styles.paymentField}>
                <Text style={styles.fieldLabel}>Discount Amount</Text>
                <Text style={styles.paymentValue}>₹{discountAmount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.paymentField}>
                <Text style={styles.fieldLabel}>Net Amount</Text>
                <Text style={styles.paymentValue}>₹{netAmount.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <SelectField
                label="Payment Mode"
                value={paymentMode}
                options={paymentModeOptions}
                onSelect={(option) => setPaymentMode(option.value)}
                placeholder="Select payment mode"
                containerStyle={styles.paymentField}
              />
              
              <FormField
                label="Amount Paid"
                value={amountPaid}
                onChangeText={setAmountPaid}
                placeholder="0.00"
                keyboardType="numeric"
                error={errors.amountPaid}
                containerStyle={styles.paymentField}
              />
              
              <View style={styles.paymentField}>
                <Text style={styles.fieldLabel}>Balance Amount</Text>
                <Text style={[
                  styles.paymentValue, 
                  balanceAmount > 0 ? styles.balanceDue : styles.balancePaid
                ]}>
                  ₹{balanceAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Additional Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <FormField
              label="Remarks"
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Any additional notes or remarks"
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              icon={<X size={18} color={colors.primary} />}
              style={styles.cancelButton}
            />
            
            <Button
              title="Register Patient"
              onPress={handleSubmit}
              loading={isSubmitting}
              icon={<Save size={18} color="#FFFFFF" />}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerItem: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  datePicker: {
    height: 40,
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  titleField: {
    width: '15%',
    marginRight: '2%',
  },
  nameField: {
    width: '33%',
    marginRight: '2%',
  },
  mobileField: {
    width: '23%',
    marginRight: '2%',
  },
  emailField: {
    width: '23%',
  },
  ageField: {
    width: '15%',
    marginRight: '2%',
  },
  sexField: {
    width: '83%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text,
  },
  packageField: {
    width: '40%',
  },
  paymentField: {
    width: '24%',
    marginRight: '1%',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  balanceDue: {
    color: colors.danger,
  },
  balancePaid: {
    color: colors.success,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cancelButton: {
    width: '48%',
  },
  submitButton: {
    width: '48%',
  },
  noMargin: {
    marginBottom: 0,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 8,
  },
});