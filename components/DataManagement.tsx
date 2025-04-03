import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Database, Download, Upload, Hospital, Save, FileText } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from './Button';
import { exportData, importData } from '@/utils/export-import';

interface DataManagementProps {
  onClose: () => void;
  onOpenHospitalSettings: () => void;
}

export default function DataManagement({ onClose, onOpenHospitalSettings }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const success = await exportData();
      if (success) {
        Alert.alert('Success', 'Data exported successfully');
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (Platform.OS === 'web') {
      // For web, trigger the file input click
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // For mobile, show an alert about the limitation
      Alert.alert(
        'Import Data',
        'This feature is currently only available on web. Please use the web version to import data.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (text) {
          try {
            const success = await importData(text);
            if (success) {
              Alert.alert('Success', 'Data imported successfully');
              // Reset the file input
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            } else {
              Alert.alert('Error', 'Failed to import data. Please check the file format.');
            }
          } catch (error) {
            console.error('Import processing error:', error);
            Alert.alert('Error', `Failed to process import: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        setIsImporting(false);
      };
      
      reader.onerror = () => {
        Alert.alert('Error', 'Failed to read the file');
        setIsImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import data');
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Database size={24} color={colors.primary} />
        <Text style={styles.title}>Data Management</Text>
      </View>

      <Text style={styles.description}>
        Manage your laboratory data, including backup, restore, and hospital settings.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hospital Settings</Text>
        <Text style={styles.sectionDescription}>
          Configure your hospital details that will appear on reports and invoices.
        </Text>
        <Button
          title="Hospital Settings"
          onPress={onOpenHospitalSettings}
          variant="primary"
          style={styles.button}
          icon={<Hospital size={18} color="#FFFFFF" />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Backup & Restore</Text>
        <Text style={styles.sectionDescription}>
          Export your data for backup or import previously exported data.
        </Text>
        <Button
          title="Export Data"
          onPress={handleExportData}
          variant="outline"
          style={styles.button}
          icon={<Upload size={18} color={colors.primary} />}
          loading={isExporting}
        />
        <Button
          title="Import Data"
          onPress={handleImportData}
          variant="outline"
          style={[styles.button, styles.marginTop]}
          icon={<Download size={18} color={colors.primary} />}
          loading={isImporting}
        />
        
        {/* Hidden file input for web platform */}
        {Platform.OS === 'web' && (
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />
        )}
      </View>

      <Button
        title="Close"
        onPress={onClose}
        variant="outline"
        style={styles.closeButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  marginTop: {
    marginTop: 12,
  },
  closeButton: {
    width: '100%',
  },
});