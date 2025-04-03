import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HospitalDetails {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
  taxId?: string;
  logo?: string;
  footer?: string;
  bankDetails?: string;
}

interface HospitalState {
  details: HospitalDetails;
  updateDetails: (details: Partial<HospitalDetails>) => void;
  resetDetails: () => void;
}

// Default hospital details
const defaultHospitalDetails: HospitalDetails = {
  name: 'NVR DIAGNOSTICS',
  address: 'Santharam Hospital, Dowlaiswaram, Rajamahendravaram - 7780377630',
  phone: '+91 99089 91881, 81214 38888',
  email: 'info@nvrdiagnostics.com',
  website: 'www.nvrdiagnostics.com',
  registrationNumber: 'NVR-DIAG-12345',
  taxId: 'GST-ID-67890',
  logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=200&auto=format&fit=crop',
  footer: 'Thank you for choosing NVR Diagnostics. For any queries, please contact our customer support.',
};

export const useHospitalStore = create<HospitalState>()(
  persist(
    (set) => ({
      details: { ...defaultHospitalDetails },
      
      updateDetails: (newDetails) => {
        set((state) => ({
          details: {
            ...state.details,
            ...newDetails,
          },
        }));
      },
      
      resetDetails: () => {
        set({
          details: { ...defaultHospitalDetails },
        });
      },
    }),
    {
      name: 'hospital-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);