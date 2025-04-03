// Common types used throughout the app

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  createdAt: string;
};

export type Test = {
  id: string;
  name: string;
  category: string;
  parameters: TestParameter[];
  price: number;
  createdAt: string;
};

export type TestParameter = {
  name: string;
  unit: string;
  normalRange: string;
};

export type Report = {
  id: string;
  patientId: string;
  testId: string;
  results: TestResult[];
  status: 'Pending' | 'Completed';
  createdAt: string;
  referringDoctor?: string;
  notes?: string; // Added notes field
};

export type TestResult = {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
  normalRange: string;
  isNormal: boolean;
};

export type Invoice = {
  id: string;
  patientId: string;
  tests: string[];
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Due';
  paymentMethod?: 'Cash' | 'Card' | 'UPI';
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Receptionist' | 'Technician' | 'Doctor';
};

export type HospitalDetails = {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  logo?: string; // Base64 encoded image or URL
  registrationNumber?: string;
  taxId?: string;
  footer?: string;
};