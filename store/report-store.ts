import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, TestResult } from '@/types';

type ReportState = {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  addReport: (report: Omit<Report, 'id' | 'createdAt'> & { id?: string, createdAt?: string }) => Promise<Report>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report | null>;
  updateReportResults: (id: string, results: TestResult[]) => Promise<Report | null>;
  deleteReport: (id: string) => Promise<boolean>;
  getReportById: (id: string) => Report | undefined;
  getReportsByPatientId: (patientId: string) => Report[];
  getPendingReports: () => Report[];
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      isLoading: false,
      error: null,
      
      fetchReports: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          // For our app, we'll just use the persisted data
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // We're not setting reports here because they're already loaded from persistence
          set({ isLoading: false });
          return;
        } catch (error) {
          console.error('Error fetching reports:', error);
          set({ isLoading: false, error: 'Failed to fetch reports' });
        }
      },
      
      addReport: async (reportData) => {
        set({ isLoading: true, error: null });
        try {
          // Generate a new report with ID and timestamp
          const newReport: Report = {
            id: reportData.id || `r${Date.now()}`,
            patientId: reportData.patientId,
            testId: reportData.testId,
            results: reportData.results || [],
            status: reportData.status || 'Pending',
            referringDoctor: reportData.referringDoctor || '',
            notes: reportData.notes || '',
            createdAt: reportData.createdAt || new Date().toISOString(),
          };
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to state
          set((state) => ({
            reports: [...state.reports, newReport],
            isLoading: false,
          }));
          
          return newReport;
        } catch (error) {
          console.error('Error adding report:', error);
          set({ isLoading: false, error: 'Failed to add report' });
          throw error;
        }
      },
      
      updateReport: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { reports } = get();
          const reportIndex = reports.findIndex(r => r.id === id);
          
          if (reportIndex === -1) {
            set({ isLoading: false, error: 'Report not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedReport = {
            ...reports[reportIndex],
            ...updates,
          };
          
          const updatedReports = [...reports];
          updatedReports[reportIndex] = updatedReport;
          
          set({ reports: updatedReports, isLoading: false });
          return updatedReport;
        } catch (error) {
          console.error('Error updating report:', error);
          set({ isLoading: false, error: 'Failed to update report' });
          throw error;
        }
      },
      
      updateReportResults: async (id, results) => {
        set({ isLoading: true, error: null });
        try {
          const { reports } = get();
          const reportIndex = reports.findIndex(r => r.id === id);
          
          if (reportIndex === -1) {
            set({ isLoading: false, error: 'Report not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedReport = {
            ...reports[reportIndex],
            results,
            status: 'Completed' as const,
          };
          
          const updatedReports = [...reports];
          updatedReports[reportIndex] = updatedReport;
          
          set({ reports: updatedReports, isLoading: false });
          return updatedReport;
        } catch (error) {
          console.error('Error updating report results:', error);
          set({ isLoading: false, error: 'Failed to update report results' });
          throw error;
        }
      },
      
      deleteReport: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { reports } = get();
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedReports = reports.filter(r => r.id !== id);
          
          if (updatedReports.length === reports.length) {
            set({ isLoading: false, error: 'Report not found' });
            return false;
          }
          
          set({ reports: updatedReports, isLoading: false });
          return true;
        } catch (error) {
          console.error('Error deleting report:', error);
          set({ isLoading: false, error: 'Failed to delete report' });
          throw error;
        }
      },
      
      getReportById: (id) => {
        return get().reports.find(r => r.id === id);
      },
      
      getReportsByPatientId: (patientId) => {
        return get().reports.filter(r => r.patientId === patientId);
      },
      
      getPendingReports: () => {
        return get().reports.filter(r => r.status === 'Pending');
      },
    }),
    {
      name: 'report-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reports: state.reports,
      }),
    }
  )
);