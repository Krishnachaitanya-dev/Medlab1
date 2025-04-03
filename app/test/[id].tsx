import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useTestStore } from '@/store/test-store';
import Button from '@/components/Button';
import { Edit, Trash2, Tag, IndianRupee } from 'lucide-react-native';

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTestById, deleteTest } = useTestStore();

  const test = getTestById(id as string);

  if (!test) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Test not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTest(test.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // In a real app, this would navigate to an edit form
    Alert.alert('Edit Test', 'This feature would allow editing test details.');
  };

  // Format date
  const formattedDate = new Date(test.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: test.name,
          headerTitle: test.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                title="Edit"
                onPress={handleEdit}
                variant="outline"
                size="small"
                style={styles.editButton}
              />
              <Button
                title="Delete"
                onPress={handleDelete}
                variant="danger"
                size="small"
              />
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Information</Text>
          
          <View style={styles.infoRow}>
            <Tag size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{test.category}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <IndianRupee size={20} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>₹{test.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parameters</Text>
          
          {test.parameters.map((param, index) => (
            <View key={index} style={styles.parameterItem}>
              <View style={styles.parameterHeader}>
                <Text style={styles.parameterName}>{param.name}</Text>
                <Text style={styles.parameterUnit}>{param.unit}</Text>
              </View>
              <Text style={styles.parameterRange}>
                Normal Range: {param.normalRange}
              </Text>
            </View>
          ))}
        </View>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
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
  parameterItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  parameterUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  parameterRange: {
    fontSize: 14,
    color: colors.textSecondary,
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