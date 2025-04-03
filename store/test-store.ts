import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Test } from '@/types';

type TestState = {
  tests: Test[];
  isLoading: boolean;
  error: string | null;
  fetchTests: () => Promise<void>;
  addTest: (test: Omit<Test, 'id' | 'createdAt'> & { id?: string }) => Promise<Test>;
  updateTest: (id: string, updates: Partial<Test>) => Promise<Test | null>;
  deleteTest: (id: string) => Promise<boolean>;
  getTestById: (id: string) => Test | undefined;
  searchTests: (query: string) => Test[];
  getTestsByCategory: (category: string) => Test[];
};

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      tests: [],
      isLoading: false,
      error: null,
      
      fetchTests: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          // For our app, we'll just use the persisted data
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // We're not setting tests here because they're already loaded from persistence
          set({ isLoading: false });
          return;
        } catch (error) {
          console.error('Error fetching tests:', error);
          set({ isLoading: false, error: 'Failed to fetch tests' });
        }
      },
      
      addTest: async (testData) => {
        set({ isLoading: true, error: null });
        try {
          // Generate a new test with ID and timestamp
          const newTest: Test = {
            id: testData.id || `t${Date.now()}`,
            name: testData.name,
            category: testData.category,
            parameters: testData.parameters,
            price: testData.price,
            createdAt: new Date().toISOString(),
          };
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Add to state
          set((state) => ({
            tests: [...state.tests, newTest],
            isLoading: false,
          }));
          
          return newTest;
        } catch (error) {
          console.error('Error adding test:', error);
          set({ isLoading: false, error: 'Failed to add test' });
          throw error;
        }
      },
      
      updateTest: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { tests } = get();
          const testIndex = tests.findIndex(t => t.id === id);
          
          if (testIndex === -1) {
            set({ isLoading: false, error: 'Test not found' });
            return null;
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedTest = {
            ...tests[testIndex],
            ...updates,
          };
          
          const updatedTests = [...tests];
          updatedTests[testIndex] = updatedTest;
          
          set({ tests: updatedTests, isLoading: false });
          return updatedTest;
        } catch (error) {
          console.error('Error updating test:', error);
          set({ isLoading: false, error: 'Failed to update test' });
          throw error;
        }
      },
      
      deleteTest: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { tests } = get();
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedTests = tests.filter(t => t.id !== id);
          
          if (updatedTests.length === tests.length) {
            set({ isLoading: false, error: 'Test not found' });
            return false;
          }
          
          set({ tests: updatedTests, isLoading: false });
          return true;
        } catch (error) {
          console.error('Error deleting test:', error);
          set({ isLoading: false, error: 'Failed to delete test' });
          throw error;
        }
      },
      
      getTestById: (id) => {
        return get().tests.find(t => t.id === id);
      },
      
      searchTests: (query) => {
        const { tests } = get();
        if (!query) return tests;
        
        const lowerQuery = query.toLowerCase();
        return tests.filter(
          t => t.name.toLowerCase().includes(lowerQuery) || 
               t.category.toLowerCase().includes(lowerQuery)
        );
      },
      
      getTestsByCategory: (category) => {
        const { tests } = get();
        if (!category) return tests;
        
        return tests.filter(t => t.category === category);
      },
    }),
    {
      name: 'test-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tests: state.tests,
      }),
    }
  )
);