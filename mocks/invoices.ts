import { Invoice } from '@/types';

export const invoices: Invoice[] = [
  {
    id: 'i1',
    patientId: 'p1',
    tests: ['t1'],
    totalAmount: 800.00,
    status: 'Paid',
    paymentMethod: 'Cash',
    createdAt: '2023-10-15T09:35:00Z',
  },
  {
    id: 'i2',
    patientId: 'p2',
    tests: ['t2'],
    totalAmount: 1200.00,
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: '2023-10-16T14:50:00Z',
  },
  {
    id: 'i3',
    patientId: 'p3',
    tests: ['t3'],
    totalAmount: 500.00,
    status: 'Paid',
    paymentMethod: 'UPI',
    createdAt: '2023-10-17T11:20:00Z',
  },
  {
    id: 'i4',
    patientId: 'p4',
    tests: ['t4'],
    totalAmount: 1500.00,
    status: 'Pending',
    createdAt: '2023-10-18T16:25:00Z',
  },
  {
    id: 'i5',
    patientId: 'p5',
    tests: ['t5'],
    totalAmount: 1800.00,
    status: 'Due',
    createdAt: '2023-10-19T10:05:00Z',
  },
];