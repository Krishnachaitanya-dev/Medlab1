import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from './Button';
import SearchBar from './SearchBar';
import { useTestStore } from '@/store/test-store';
import { useReportStore } from '@/store/report-store';
import { useInvoiceStore } from '@/store/invoice-store';
import TestSelectionItem from './TestSelectionItem';
import { Test } from '@/types';

interface TestSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  patientId: string;
}

export default function TestSelectionModal({ visible, onClose, patientId }: TestSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { tests, fetchTests } = useTestStore();
  const { addReport } = useReportStore();
  const { addInvoice } = useInvoiceStore();
  
  useEffect(() => {
    fetchTests();
  }, []);
  
  useEffect(() => {
    // Reset selected tests when modal is opened
    if (visible) {
      setSelectedTests([]);
      setSearchQuery('');
    }
  }, [visible]);
  
  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleToggleTest = (test: Test) => {
    if (selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };
  
  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      Alert.alert('Error', 'Please select at least one test');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create reports for each selected test
      await Promise.all(selectedTests.map(test => 
        addReport({
          patientId,
          testId: test.id,
          results: [],
          status: 'Pending',
        })
      ));
      
      // Create an invoice for all selected tests
      await addInvoice({
        patientId,
        tests: selectedTests.map(test => test.id),
        totalAmount: selectedTests.reduce((sum, test) => sum + test.price, 0),
        status: 'Pending',
      });
      
      Alert.alert('Success', 'Tests added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding tests:', error);
      Alert.alert('Error', 'Failed to add tests');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Tests</Text>
            <Button
              title=""
              onPress={onClose}
              variant="outline"
              size="small"
              style={styles.closeButton}
              icon={<X size={20} color={colors.text} />}
            />
          </View>
          
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tests by name or category"
          />
          
          <FlatList
            data={filteredTests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TestSelectionItem
                test={item}
                isSelected={selectedTests.some(t => t.id === item.id)}
                onToggle={() => handleToggleTest(item)}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tests found</Text>
              </View>
            }
          />
          
          <View style={styles.footer}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedCount}>
                Selected: {selectedTests.length} tests
              </Text>
              <Text style={styles.totalAmount}>
                Total: ₹{selectedTests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}
              </Text>
            </View>
            
            <Button
              title="Add Tests"
              onPress={handleSubmit}
              loading={isSubmitting}
              icon={<Plus size={18} color="#FFFFFF" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    maxHeight: 400,
    marginTop: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
});