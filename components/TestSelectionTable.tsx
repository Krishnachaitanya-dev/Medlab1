import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Search, Plus, Trash2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Test } from '@/types';

interface TestSelectionTableProps {
  selectedTests: Test[];
  onRemoveTest: (testId: string) => void;
  onAddTest: (test: Test) => void;
  availableTests: Test[];
}

export default function TestSelectionTable({
  selectedTests,
  onRemoveTest,
  onAddTest,
  availableTests
}: TestSelectionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [testCode, setTestCode] = useState('');
  
  const filteredTests = availableTests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };
  
  const handleSelectTest = (test: Test) => {
    onAddTest(test);
    setSearchQuery('');
    setShowSearchResults(false);
  };
  
  const handleAddByCode = () => {
    if (testCode.trim()) {
      const test = availableTests.find(t => t.id.toLowerCase() === testCode.toLowerCase());
      if (test) {
        onAddTest(test);
        setTestCode('');
      }
    }
  };

  const renderTestItem = ({ item }: { item: Test }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.testNameCell]}>{item.name}</Text>
      <Text style={[styles.tableCell, styles.testCodeCell]}>{item.id}</Text>
      <Text style={[styles.tableCell, styles.priceCell]}>₹{item.price.toFixed(2)}</Text>
      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveTest(item.id)}
        >
          <Trash2 size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search test by name"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Search size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.codeInputContainer}>
          <TextInput
            style={styles.codeInput}
            value={testCode}
            onChangeText={setTestCode}
            placeholder="Test code"
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddByCode}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearchResults && searchQuery.trim() && (
        <View style={styles.searchResults}>
          <FlatList
            data={filteredTests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleSelectTest(item)}
              >
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultCode}>{item.id}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noResultsText}>No tests found</Text>
            }
            style={styles.searchResultsList}
          />
        </View>
      )}
      
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.testNameCell]}>Test Name</Text>
          <Text style={[styles.headerCell, styles.testCodeCell]}>Code</Text>
          <Text style={[styles.headerCell, styles.priceCell]}>Price</Text>
          <Text style={[styles.headerCell, styles.actionCell]}>Action</Text>
        </View>
        
        {selectedTests.length > 0 ? (
          <FlatList
            data={selectedTests}
            keyExtractor={(item) => item.id}
            renderItem={renderTestItem}
            style={styles.tableBody}
          />
        ) : (
          <View style={styles.emptyTable}>
            <Text style={styles.emptyText}>No tests selected</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 3,
    flexDirection: 'row',
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeInputContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  codeInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchResultsList: {
    padding: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultName: {
    fontSize: 14,
    color: colors.text,
  },
  searchResultCode: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  noResultsText: {
    padding: 12,
    textAlign: 'center',
    color: colors.textLight,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 12,
  },
  headerCell: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  testNameCell: {
    flex: 3,
  },
  testCodeCell: {
    flex: 1,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
  },
  tableBody: {
    maxHeight: 200,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 12,
    backgroundColor: colors.background,
  },
  tableCell: {
    fontSize: 14,
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  emptyTable: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
  },
});