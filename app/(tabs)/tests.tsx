import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useTestStore } from '@/store/test-store';
import TestCard from '@/components/TestCard';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { Microscope, Plus } from 'lucide-react-native';
import AddTestModal from '@/components/AddTestModal';

export default function TestsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [addTestModalVisible, setAddTestModalVisible] = useState(false);
  const router = useRouter();
  const { tests, fetchTests, addTest } = useTestStore();

  useEffect(() => {
    fetchTests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTests();
    setRefreshing(false);
  };

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTest = () => {
    setAddTestModalVisible(true);
  };

  const handleAddTestSubmit = async (testData: {
    name: string;
    category: string;
    parameters: { name: string; unit: string; normalRange: string }[];
    price: number;
  }) => {
    try {
      await addTest(testData);
      setAddTestModalVisible(false);
      Alert.alert('Success', 'Test added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add test');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tests by name or category"
        />
        <Button
          title="Add"
          onPress={handleAddTest}
          variant="primary"
          style={styles.addButton}
          size="small"
        />
      </View>

      <FlatList
        data={filteredTests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TestCard
            test={item}
            onPress={() => router.push(`/test/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Microscope size={40} color={colors.primary} />}
            title="No tests found"
            message={searchQuery ? "Try a different search term" : "Add your first test to get started"}
            actionLabel="Add Test"
            onAction={handleAddTest}
          />
        }
      />

      <AddTestModal
        visible={addTestModalVisible}
        onClose={() => setAddTestModalVisible(false)}
        onSubmit={handleAddTestSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    height: 44,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
});