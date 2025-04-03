import { Test } from '@/types';

export const tests: Test[] = [
  {
    id: 't1',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    parameters: [
      { name: 'Hemoglobin', unit: 'g/dL', normalRange: '13.5-17.5' },
      { name: 'White Blood Cells', unit: 'K/uL', normalRange: '4.5-11.0' },
      { name: 'Platelets', unit: 'K/uL', normalRange: '150-450' },
    ],
    price: 800.00,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 't2',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    parameters: [
      { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200' },
      { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '>40' },
      { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '<100' },
      { name: 'Triglycerides', unit: 'mg/dL', normalRange: '<150' },
    ],
    price: 1200.00,
    createdAt: '2023-01-02T00:00:00Z',
  },
  {
    id: 't3',
    name: 'Blood Glucose',
    category: 'Biochemistry',
    parameters: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', normalRange: '70-100' },
    ],
    price: 500.00,
    createdAt: '2023-01-03T00:00:00Z',
  },
  {
    id: 't4',
    name: 'Liver Function Test',
    category: 'Biochemistry',
    parameters: [
      { name: 'ALT', unit: 'U/L', normalRange: '7-56' },
      { name: 'AST', unit: 'U/L', normalRange: '5-40' },
      { name: 'Bilirubin', unit: 'mg/dL', normalRange: '0.1-1.2' },
    ],
    price: 1500.00,
    createdAt: '2023-01-04T00:00:00Z',
  },
  {
    id: 't5',
    name: 'Thyroid Profile',
    category: 'Endocrinology',
    parameters: [
      { name: 'TSH', unit: 'uIU/mL', normalRange: '0.4-4.0' },
      { name: 'T3', unit: 'ng/dL', normalRange: '80-200' },
      { name: 'T4', unit: 'ug/dL', normalRange: '5.0-12.0' },
    ],
    price: 1800.00,
    createdAt: '2023-01-05T00:00:00Z',
  },
];