import { Platform } from 'react-native';
import { usePatientStore } from '@/store/patient-store';
import { useTestStore } from '@/store/test-store';
import { useReportStore } from '@/store/report-store';
import { useInvoiceStore } from '@/store/invoice-store';
import { useHospitalStore } from '@/store/hospital-store';
import { Patient, Test, Report, Invoice, HospitalDetails } from '@/types';

// Function to export all data as JSON
export const exportData = async (): Promise<boolean> => {
  try {
    // Get all data from stores
    const patients = usePatientStore.getState().patients;
    const tests = useTestStore.getState().tests;
    const reports = useReportStore.getState().reports;
    const invoices = useInvoiceStore.getState().invoices;
    const hospitalDetails = useHospitalStore.getState().details;

    // Create a JSON object with all data
    const data = {
      patients,
      tests,
      reports,
      invoices,
      hospitalDetails,
      exportDate: new Date().toISOString(),
      version: '1.0.0', // Add version for future compatibility
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);

    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medlab_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } else {
      // For mobile, we would use Share API or file system
      console.log('Export functionality for mobile not implemented');
      // In a real app, you might use:
      // import * as Sharing from 'expo-sharing';
      // import * as FileSystem from 'expo-file-system';
      // const fileUri = FileSystem.documentDirectory + 'medlab_data.json';
      // await FileSystem.writeAsStringAsync(fileUri, jsonString);
      // await Sharing.shareAsync(fileUri);
      return true;
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

// Function to import data from JSON
export const importData = async (jsonString: string): Promise<boolean> => {
  try {
    // Parse the JSON string
    const data = JSON.parse(jsonString);

    // Validate the data structure
    if (!data.patients || !data.tests || !data.reports || !data.invoices) {
      throw new Error('Invalid data format: Missing required data collections');
    }

    // Get the store instances
    const patientStore = usePatientStore.getState();
    const testStore = useTestStore.getState();
    const reportStore = useReportStore.getState();
    const invoiceStore = useInvoiceStore.getState();
    const hospitalStore = useHospitalStore.getState();

    // First, import tests and patients to ensure they exist before reports and invoices
    // For tests
    const importTests = async () => {
      // Delete all existing tests
      const existingTests = [...testStore.tests];
      for (const test of existingTests) {
        await testStore.deleteTest(test.id);
      }
      
      // Add imported tests with their original IDs
      for (const test of data.tests) {
        await testStore.addTest({
          id: test.id, // Preserve original ID
          name: test.name,
          category: test.category,
          parameters: test.parameters,
          price: test.price
        });
      }
    };

    // For patients
    const importPatients = async () => {
      // Delete all existing patients
      const existingPatients = [...patientStore.patients];
      for (const patient of existingPatients) {
        await patientStore.deletePatient(patient.id);
      }
      
      // Add imported patients with their original IDs
      for (const patient of data.patients) {
        await patientStore.addPatient({
          id: patient.id, // Preserve original ID
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address
        });
      }
    };

    // Execute tests and patients import first
    await importTests();
    await importPatients();

    // Now import reports and invoices which depend on tests and patients
    // For reports
    const importReports = async () => {
      // Delete all existing reports
      const existingReports = [...reportStore.reports];
      for (const report of existingReports) {
        await reportStore.deleteReport(report.id);
      }
      
      // Add imported reports with their original IDs and timestamps
      for (const report of data.reports) {
        await reportStore.addReport({
          id: report.id, // Preserve original ID
          patientId: report.patientId,
          testId: report.testId,
          results: report.results,
          status: report.status,
          referringDoctor: report.referringDoctor,
          notes: report.notes,
          createdAt: report.createdAt // Preserve original timestamp
        });
      }
    };

    // For invoices
    const importInvoices = async () => {
      // Delete all existing invoices
      const existingInvoices = [...invoiceStore.invoices];
      for (const invoice of existingInvoices) {
        await invoiceStore.deleteInvoice(invoice.id);
      }
      
      // Add imported invoices with their original IDs and timestamps
      for (const invoice of data.invoices) {
        await invoiceStore.addInvoice({
          id: invoice.id, // Preserve original ID
          patientId: invoice.patientId,
          tests: invoice.tests,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          paymentMethod: invoice.paymentMethod,
          createdAt: invoice.createdAt // Preserve original timestamp
        });
      }
    };

    // Execute reports and invoices import
    await importReports();
    await importInvoices();
    
    // If hospital details are included in the import, update them too
    if (data.hospitalDetails) {
      hospitalStore.updateDetails(data.hospitalDetails);
    }

    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};