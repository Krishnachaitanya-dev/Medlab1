import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useReportStore } from '@/store/report-store';
import { usePatientStore } from '@/store/patient-store';
import { useTestStore } from '@/store/test-store';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import ResultInputItem from '@/components/ResultInputItem';
import HospitalHeader from '@/components/HospitalHeader';
import { Calendar, User, Microscope, CheckCircle, XCircle, Share2, Printer } from 'lucide-react-native';
import { TestResult } from '@/types';
import { generateReport } from '@/utils/print';
import { useHospitalStore } from '@/store/hospital-store';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getReportById, updateReportResults, updateReport } = useReportStore();
  const { getPatientById } = usePatientStore();
  const { getTestById } = useTestStore();
  const { details: hospitalDetails } = useHospitalStore();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [resultValues, setResultValues] = useState<{[key: string]: string}>({});
  
  const report = getReportById(id as string);
  
  useEffect(() => {
    if (report && report.results.length > 0) {
      // Initialize result values from existing results
      const initialValues: {[key: string]: string} = {};
      report.results.forEach(result => {
        initialValues[result.parameterName] = result.value;
      });
      setResultValues(initialValues);
    }
  }, [report]);
  
  if (!report) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Report not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  const patient = getPatientById(report.patientId);
  const test = getTestById(report.testId);

  if (!patient || !test) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Patient or test data not found</Text>
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
  const formattedDate = new Date(report.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const handleValueChange = (paramName: string, value: string) => {
    setResultValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleSaveResults = async () => {
    setIsUpdating(true);
    
    try {
      // Convert result values to TestResult array
      const results: TestResult[] = test.parameters.map(param => {
        const value = resultValues[param.name] || '';
        const numValue = parseFloat(value);
        let isNormal = false;
        
        // Check if normal range contains a hyphen (range)
        if (param.normalRange.includes('-')) {
          const [min, max] = param.normalRange.split('-').map(v => parseFloat(v));
          isNormal = numValue >= min && numValue <= max;
        } 
        // Check if normal range is "less than" format
        else if (param.normalRange.includes('<')) {
          const max = parseFloat(param.normalRange.replace('<', ''));
          isNormal = numValue < max;
        } 
        // Check if normal range is "greater than" format
        else if (param.normalRange.includes('>')) {
          const min = parseFloat(param.normalRange.replace('>', ''));
          isNormal = numValue > min;
        }
        
        return {
          parameterId: `param-${param.name}`,
          parameterName: param.name,
          value,
          unit: param.unit,
          normalRange: param.normalRange,
          isNormal,
        };
      });
      
      await updateReportResults(report.id, results);
      setIsEditing(false);
      Alert.alert('Success', 'Test results saved successfully');
    } catch (error) {
      console.error('Error saving results:', error);
      Alert.alert('Error', 'Failed to save test results');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePrintReport = () => {
    if (Platform.OS === 'web') {
      setIsPrinting(true);
      try {
        // Prepare report data for printing
        const reportData = {
          id: report.id,
          date: report.createdAt,
          patientName: patient.name,
          patientId: patient.id,
          patientAge: patient.age,
          patientGender: patient.gender,
          testName: test.name,
          testCategory: test.category,
          referringDoctor: report.referringDoctor || "Dr. Not Specified",
          results: report.results,
          notes: report.notes || '',
          hospitalDetails: {
            name: hospitalDetails?.name || 'Medical Laboratory',
            address: hospitalDetails?.address || '',
            phone: hospitalDetails?.phone || '',
            email: hospitalDetails?.email || '',
            logo: hospitalDetails?.logo || '',
            tagline: hospitalDetails?.tagline || '',
            footer: hospitalDetails?.footer || 'This is a computer-generated report. No signature is required.'
          }
        };
        
        generateReport(reportData);
      } catch (error) {
        console.error('Error printing report:', error);
        Alert.alert('Error', 'Failed to print report');
      } finally {
        setIsPrinting(false);
      }
    } else {
      Alert.alert('Print Report', 'This feature is only available on web.');
    }
  };
  
  const handleShareReport = async () => {
    try {
      const reportText = `
${hospitalDetails?.name || 'Medical Laboratory'}
${hospitalDetails?.address || ''}
Phone: ${hospitalDetails?.phone || ''}
${hospitalDetails?.email ? `Email: ${hospitalDetails?.email}` : ''}

LABORATORY REPORT

Patient: ${patient.name}
Age/Gender: ${patient.age} years, ${patient.gender}
Test: ${test.name}
Date: ${formattedDate}
Status: ${report.status}

Results:
${report.results.map(r => `${r.parameterName}: ${r.value} ${r.unit} (Normal Range: ${r.normalRange} ${r.unit}) - ${r.isNormal ? 'Normal' : 'Abnormal'}`).join('\n')}

${hospitalDetails?.footer || 'This is a computer-generated report. No signature is required.'}
      `;
      
      await Share.share({
        message: reportText,
        title: `${hospitalDetails?.name || 'Medical Laboratory'} - Medical Report`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: `Report #${report.id.replace('r', '')}`,
          headerTitle: `Report #${report.id.replace('r', '')}`,
          headerRight: () => (
            <View style={styles.headerButtons}>
              {report.status === 'Completed' && (
                <>
                  <Button
                    title="Print"
                    onPress={handlePrintReport}
                    variant="outline"
                    size="small"
                    style={styles.headerButton}
                    loading={isPrinting}
                    icon={<Printer size={16} color={colors.primary} />}
                  />
                  <Button
                    title="Share"
                    onPress={handleShareReport}
                    variant="outline"
                    size="small"
                    style={styles.headerButton}
                    icon={<Share2 size={16} color={colors.primary} />}
                  />
                </>
              )}
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View id="report-content" style={styles.reportContent}>
          {/* Hospital Header with Lab Report layout */}
          <HospitalHeader showLabReport={true} showLogo={true} />
          
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.reportTitle}>{test.name}</Text>
              <StatusBadge status={report.status} size="medium" />
            </View>
            <Text style={styles.reportDate}>
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
                <Text style={styles.infoLabel}>Age & Gender</Text>
                <Text style={styles.infoValue}>{patient.age} years, {patient.gender}</Text>
              </View>
            </View>
            
            {report.referringDoctor && (
              <View style={styles.infoRow}>
                <User size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Referring Doctor</Text>
                  <Text style={styles.infoValue}>{report.referringDoctor}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Test Results</Text>
              <Text style={styles.testCategory}>{test.category}</Text>
            </View>
            
            {report.status === 'Completed' && !isEditing ? (
              <>
                {report.results.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultName}>{result.parameterName}</Text>
                      <View style={styles.resultValueContainer}>
                        <Text 
                          style={[
                            styles.resultValue, 
                            !result.isNormal && styles.resultValueAbnormal
                          ]}
                        >
                          {result.value} {result.unit}
                        </Text>
                        {result.isNormal ? (
                          <CheckCircle size={16} color={colors.success} style={styles.resultIcon} />
                        ) : (
                          <XCircle size={16} color={colors.danger} style={styles.resultIcon} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.resultRange}>
                      Normal Range: {result.normalRange} {result.unit}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>
          
          {report.status === 'Completed' && report.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notesText}>{report.notes}</Text>
            </View>
          )}
          
          {report.status === 'Completed' && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>{hospitalDetails?.footer || 'This is a computer-generated report. No signature is required.'}</Text>
            </View>
          )}
        </View>
        
        {report.status === 'Completed' && !isEditing ? (
          <Button
            title="Edit Results"
            onPress={() => setIsEditing(true)}
            variant="outline"
            style={styles.editButton}
          />
        ) : (
          <View style={styles.resultsInputContainer}>
            {test.parameters.map((param, index) => (
              <ResultInputItem
                key={index}
                parameter={param}
                value={resultValues[param.name] || ''}
                onValueChange={(value) => handleValueChange(param.name, value)}
              />
            ))}
            
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={3}
                placeholder="Add any additional notes or observations"
                value={report.notes || ''}
                onChangeText={(text) => updateReport(report.id, { notes: text })}
              />
            </View>
            
            <View style={styles.actionButtons}>
              {isEditing && (
                <Button
                  title="Cancel"
                  onPress={() => setIsEditing(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
              )}
              <Button
                title={isEditing ? "Save Changes" : "Complete Test"}
                onPress={handleSaveResults}
                loading={isUpdating}
                style={styles.saveButton}
              />
            </View>
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
  reportContent: {
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
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  reportDate: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  testCategory: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultValueAbnormal: {
    color: colors.danger,
  },
  resultIcon: {
    marginLeft: 6,
  },
  resultRange: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultsInputContainer: {
    marginTop: 8,
  },
  notesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    textAlignVertical: 'top',
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    minWidth: 120,
  },
  editButton: {
    alignSelf: 'center',
    marginTop: 16,
    minWidth: 120,
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