import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { Hospital, Upload, X, Save, RotateCcw } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from './Button';
import { useHospitalStore } from '@/store/hospital-store';
import FormField from './FormField';

interface HospitalSettingsProps {
  onClose: () => void;
}

export default function HospitalSettings({ onClose }: HospitalSettingsProps) {
  const { details, updateDetails, resetDetails } = useHospitalStore();
  const [hospitalName, setHospitalName] = useState(details.name);
  const [address, setAddress] = useState(details.address);
  const [phone, setPhone] = useState(details.phone);
  const [email, setEmail] = useState(details.email || '');
  const [website, setWebsite] = useState(details.website || '');
  const [registrationNumber, setRegistrationNumber] = useState(details.registrationNumber || '');
  const [taxId, setTaxId] = useState(details.taxId || '');
  const [footer, setFooter] = useState(details.footer || '');
  const [logo, setLogo] = useState(details.logo || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateDetails({
      name: hospitalName,
      address,
      phone,
      email,
      website,
      registrationNumber,
      taxId,
      footer,
      logo
    });
    Alert.alert('Success', 'Hospital details updated successfully');
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Hospital Details',
      'Are you sure you want to reset all hospital details to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            resetDetails();
            setHospitalName(details.name);
            setAddress(details.address);
            setPhone(details.phone);
            setEmail(details.email || '');
            setWebsite(details.website || '');
            setRegistrationNumber(details.registrationNumber || '');
            setTaxId(details.taxId || '');
            setFooter(details.footer || '');
            setLogo(details.logo || '');
            Alert.alert('Success', 'Hospital details reset to default values');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLogoUpload = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      Alert.alert('Upload Logo', 'Logo upload is only available on web platform');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Hospital size={24} color={colors.primary} />
        <Text style={styles.title}>Hospital Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Text style={styles.sectionTitle}>Hospital Logo</Text>
          <View style={styles.logoContainer}>
            {logo ? (
              <View style={styles.logoWrapper}>
                <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
                <TouchableOpacity style={styles.removeLogoButton} onPress={handleRemoveLogo}>
                  <X size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderLogo}>
                <Hospital size={40} color={colors.textLight} />
              </View>
            )}
            <Button
              title="Upload Logo"
              onPress={handleLogoUpload}
              variant="outline"
              style={styles.uploadButton}
            />
            {Platform.OS === 'web' && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange as any}
              />
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          
          <FormField
            label="Hospital Name"
            value={hospitalName}
            onChangeText={setHospitalName}
            placeholder="Enter hospital name"
            required
          />
          
          <FormField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter hospital address"
            multiline
            numberOfLines={3}
            required
          />
          
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormField
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                required
              />
            </View>
            <View style={styles.halfField}>
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormField
                label="Website"
                value={website}
                onChangeText={setWebsite}
                placeholder="Enter website URL"
              />
            </View>
            <View style={styles.halfField}>
              <FormField
                label="Registration Number"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholder="Enter registration number"
              />
            </View>
          </View>
          
          <FormField
            label="Tax ID / GSTIN"
            value={taxId}
            onChangeText={setTaxId}
            placeholder="Enter tax ID or GSTIN"
          />
          
          <FormField
            label="Report Footer Text"
            value={footer}
            onChangeText={setFooter}
            placeholder="Enter text to appear at the bottom of reports"
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Reset to Default"
          onPress={handleReset}
          variant="danger"
          style={styles.resetButton}
          icon={<RotateCcw size={18} color={colors.white} />}
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
          icon={<Save size={18} color={colors.white} />}
        />
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
    maxWidth: 600,
    maxHeight: '90%',
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
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  logoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  removeLogoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLogo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flex: 1,
  },
  formSection: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  closeButton: {
    width: '100%',
  },
});