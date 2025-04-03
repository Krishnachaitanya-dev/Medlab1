import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice } from '@/types';

type InvoiceState = {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string, createdAt?: string }) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice | null>;
  updatePaymentStatus: (id: string, status: Invoice['status'], paymentMethod?: Invoice['paymentMethod']) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoicesByPatientId: (patientId: string) => Invoice[];
  getPendingInvoices: () => Invoice[];
};

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      isLoading: false,
      error: null,
      
      fetchInvoices: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          // For our app, we'll just use the persisted data
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // We're not setting invoices here because they're already loaded from persistence
          set({ isLoading: false });
          return;
        } catch (error) {
          console.error('Error fetching invoices:', error);
          set({ isLoading: false, error: 'Failed to fetch invoices' });
        }
      },
      
      addInvoice: async (invoiceData) => {
        set({ isLoading: true, error: null });
        try {
          // Generate a new invoice with ID and timestamp
          const newInvoice: Invoice = {
            id: invoiceData.id || `i${Date.now()}`,
            patientId: invoiceData.patientId,
            tests: invoiceData.tests,
            totalAmount: invoiceData.totalAmount,
            status: invoiceData.status || 'Pending',
            paymentMethod: invoiceData.paymentMethod,
            createdAt: invoiceData.createdAt || new Date().toISOString(),
          };
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to state
          set((state) => ({
            invoices: [...state.invoices, newInvoice],
            isLoading: false,
          }));
          
          return newInvoice;
        } catch (error) {
          console.error('Error adding invoice:', error);
          set({ isLoading: false, error: 'Failed to add invoice' });
          throw error;
        }
      },
      
      updateInvoice: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { invoices } = get();
          const invoiceIndex = invoices.findIndex(i => i.id === id);
          
          if (invoiceIndex === -1) {
            set({ isLoading: false, error: 'Invoice not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedInvoice = {
            ...invoices[invoiceIndex],
            ...updates,
          };
          
          const updatedInvoices = [...invoices];
          updatedInvoices[invoiceIndex] = updatedInvoice;
          
          set({ invoices: updatedInvoices, isLoading: false });
          return updatedInvoice;
        } catch (error) {
          console.error('Error updating invoice:', error);
          set({ isLoading: false, error: 'Failed to update invoice' });
          throw error;
        }
      },
      
      updatePaymentStatus: async (id, status, paymentMethod) => {
        set({ isLoading: true, error: null });
        try {
          const { invoices } = get();
          const invoiceIndex = invoices.findIndex(i => i.id === id);
          
          if (invoiceIndex === -1) {
            set({ isLoading: false, error: 'Invoice not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedInvoice = {
            ...invoices[invoiceIndex],
            status,
            ...(paymentMethod && { paymentMethod }),
          };
          
          const updatedInvoices = [...invoices];
          updatedInvoices[invoiceIndex] = updatedInvoice;
          
          set({ invoices: updatedInvoices, isLoading: false });
          return updatedInvoice;
        } catch (error) {
          console.error('Error updating payment status:', error);
          set({ isLoading: false, error: 'Failed to update payment status' });
          throw error;
        }
      },
      
      deleteInvoice: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { invoices } = get();
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedInvoices = invoices.filter(i => i.id !== id);
          
          if (updatedInvoices.length === invoices.length) {
            set({ isLoading: false, error: 'Invoice not found' });
            return false;
          }
          
          set({ invoices: updatedInvoices, isLoading: false });
          return true;
        } catch (error) {
          console.error('Error deleting invoice:', error);
          set({ isLoading: false, error: 'Failed to delete invoice' });
          throw error;
        }
      },
      
      getInvoiceById: (id) => {
        return get().invoices.find(i => i.id === id);
      },
      
      getInvoicesByPatientId: (patientId) => {
        return get().invoices.filter(i => i.patientId === patientId);
      },
      
      getPendingInvoices: () => {
        return get().invoices.filter(i => i.status === 'Pending' || i.status === 'Due');
      },
    }),
    {
      name: 'invoice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        invoices: state.invoices,
      }),
    }
  )
);