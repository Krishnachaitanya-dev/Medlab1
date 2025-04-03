import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import FormField from './FormField';
import Button from './Button';

interface ParameterInput {
  name: string;
  unit: string;
  normalRange: string;
}

interface AddTestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (testData: {
    name: string;
    category: string;
    parameters: ParameterInput[];
    price: number;
  }) => void;
}

export default function AddTestModal({
  visible,
  onClose,
  onSubmit
}: AddTestModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [parameters, setParameters] = useState<ParameterInput[]>([
    { name: '', unit: '', normalRange: '' }
  ]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleAddParameter = () => {
    setParameters([...parameters, { name: '', unit: '', normalRange: '' }]);
  };

  const handleRemoveParameter = (index: number) => {
    if (parameters.length === 1) {
      Alert.alert('Error', 'At least one parameter is required');
      return;
    }
    const newParameters = [...parameters];
    newParameters.splice(index, 1);
    setParameters(newParameters);
  };

  const handleParameterChange = (index: number, field: keyof ParameterInput, value: string) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setParameters(newParameters);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = 'Test name is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    let hasParameterError = false;
    parameters.forEach((param, index) => {
      if (!param.name.trim()) {
        newErrors[`param_${index}_name`] = 'Parameter name is required';
        hasParameterError = true;
      }
      if (!param.unit.trim()) {
        newErrors[`param_${index}_unit`] = 'Unit is required';
        hasParameterError = true;
      }
      if (!param.normalRange.trim()) {
        newErrors[`param_${index}_range`] = 'Normal range is required';
        hasParameterError = true;
      }
    });
    
    if (hasParameterError) {
      newErrors.parameters = 'Please fill in all parameter fields';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSubmit({
      name,
      category,
      parameters,
      price: parseFloat(price),
    });
    
    // Reset form
    setName('');
    setCategory('');
    setPrice('');
    setParameters([{ name: '', unit: '', normalRange: '' }]);
    setErrors({});
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setCategory('');
    setPrice('');
    setParameters([{ name: '', unit: '', normalRange: '' }]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Test</Text>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.formSection}>
              <FormField
                label="Test Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter test name"
                error={errors.name}
                required
              />
              
              <FormField
                label="Category"
                value={category}
                onChangeText={setCategory}
                placeholder="E.g., Biochemistry, Hematology"
                error={errors.category}
                required
              />
              
              <FormField
                label="Price"
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                keyboardType="decimal-pad"
                error={errors.price}
                required
              />
            </View>
            
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Test Parameters</Text>
                <Button
                  title="Add Parameter"
                  onPress={handleAddParameter}
                  variant="outline"
                  size="small"
                  style={styles.addButton}
                />
              </View>
              
              {errors.parameters && (
                <Text style={styles.errorText}>{errors.parameters}</Text>
              )}
              
              {parameters.map((param, index) => (
                <View key={index} style={styles.parameterContainer}>
                  <View style={styles.parameterHeader}>
                    <Text style={styles.parameterTitle}>Parameter {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveParameter(index)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                  
                  <FormField
                    label="Parameter Name"
                    value={param.name}
                    onChangeText={(value) => handleParameterChange(index, 'name', value)}
                    placeholder="E.g., Hemoglobin"
                    error={errors[`param_${index}_name`]}
                    required
                  />
                  
                  <View style={styles.row}>
                    <FormField
                      label="Unit"
                      value={param.unit}
                      onChangeText={(value) => handleParameterChange(index, 'unit', value)}
                      placeholder="E.g., g/dL"
                      error={errors[`param_${index}_unit`]}
                      containerStyle={styles.halfField}
                      required
                    />
                    
                    <FormField
                      label="Normal Range"
                      value={param.normalRange}
                      onChangeText={(value) => handleParameterChange(index, 'normalRange', value)}
                      placeholder="E.g., 13.5-17.5"
                      error={errors[`param_${index}_range`]}
                      containerStyle={styles.halfField}
                      required
                    />
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Add Test"
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    borderColor: colors.primary,
  },
  parameterContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  cancelButton: {
    marginRight: 12,
  },
  submitButton: {
    minWidth: 120,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 12,
  },
});