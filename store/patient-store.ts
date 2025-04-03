import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient } from '@/types';

type PatientState = {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'> & { id?: string }) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  getPatientById: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      isLoading: false,
      error: null,
      
      fetchPatients: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          // For our app, we'll just use the persisted data
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // We're not setting patients here because they're already loaded from persistence
          set({ isLoading: false });
          return;
        } catch (error) {
          console.error('Error fetching patients:', error);
          set({ isLoading: false, error: 'Failed to fetch patients' });
        }
      },
      
      addPatient: async (patientData) => {
        set({ isLoading: true, error: null });
        try {
          // Generate a new patient with ID and timestamp
          const newPatient: Patient = {
            id: patientData.id || `p${Date.now()}`,
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            phone: patientData.phone || '',
            address: patientData.address || '',
            createdAt: new Date().toISOString(),
          };
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to state
          set((state) => ({
            patients: [...state.patients, newPatient],
            isLoading: false,
          }));
          
          return newPatient;
        } catch (error) {
          console.error('Error adding patient:', error);
          set({ isLoading: false, error: 'Failed to add patient' });
          throw error;
        }
      },
      
      updatePatient: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { patients } = get();
          const patientIndex = patients.findIndex(p => p.id === id);
          
          if (patientIndex === -1) {
            set({ isLoading: false, error: 'Patient not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedPatient = {
            ...patients[patientIndex],
            ...updates,
          };
          
          const updatedPatients = [...patients];
          updatedPatients[patientIndex] = updatedPatient;
          
          set({ patients: updatedPatients, isLoading: false });
          return updatedPatient;
        } catch (error) {
          console.error('Error updating patient:', error);
          set({ isLoading: false, error: 'Failed to update patient' });
          throw error;
        }
      },
      
      deletePatient: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { patients } = get();
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedPatients = patients.filter(p => p.id !== id);
          
          if (updatedPatients.length === patients.length) {
            set({ isLoading: false, error: 'Patient not found' });
            return false;
          }
          
          set({ patients: updatedPatients, isLoading: false });
          return true;
        } catch (error) {
          console.error('Error deleting patient:', error);
          set({ isLoading: false, error: 'Failed to delete patient' });
          throw error;
        }
      },
      
      getPatientById: (id) => {
        return get().patients.find(p => p.id === id);
      },
      
      searchPatients: (query) => {
        const { patients } = get();
        if (!query) return patients;
        
        const lowerQuery = query.toLowerCase();
        return patients.filter(
          p => p.name.toLowerCase().includes(lowerQuery) || 
               p.id.toLowerCase().includes(lowerQuery) ||
               (p.phone && p.phone.includes(query))
        );
      },
    }),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        patients: state.patients,
      }),
    }
  )
);