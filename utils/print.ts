import { Platform } from 'react-native';

// Type for report data
type ReportData = {
  id: string;
  date: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  testCategory?: string;
  referringDoctor?: string;
  results: Array<{
    parameterName: string;
    value: string;
    unit: string;
    normalRange: string;
    isNormal: boolean;
  }>;
  notes?: string;
  hospitalDetails: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
    tagline?: string;
    footer?: string;
  };
};

// Type for invoice data
type InvoiceData = {
  id: string;
  date: string;
  patientName: string;
  patientId: string;
  tests: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  hospitalDetails: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
    tagline?: string;
    footer?: string;
  };
};

// Function to generate and print a report
export const generateReport = (reportData: ReportData) => {
  if (Platform.OS !== 'web') {
    console.log('Print functionality is only available on web');
    return;
  }

  // Format date
  const formattedDate = new Date(reportData.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window. Please check if pop-ups are blocked.');
    return;
  }

  // Get hospital details from the passed data
  const hospitalName = reportData.hospitalDetails?.name || 'Medical Laboratory';
  const hospitalAddress = reportData.hospitalDetails?.address || '';
  const hospitalLogo = reportData.hospitalDetails?.logo || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=200&auto=format&fit=crop';

  // HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Report - ${reportData.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .report-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e0e0e0;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .lab-icon {
          width: 50px;
          height: 50px;
          background-color: #4A6FA5;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .lab-icon svg {
          width: 30px;
          height: 30px;
          fill: white;
        }
        .lab-report-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          text-align: center;
          flex: 1;
        }
        .logo-container {
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .logo {
          max-width: 100%;
          max-height: 100%;
        }
        .color-line {
          height: 5px;
          width: 100%;
          margin: 5px 0 20px 0;
          background: linear-gradient(to right, 
            #FF0000 0%, #FF0000 33%, 
            #0000FF 33%, #0000FF 66%, 
            #008000 66%, #008000 100%);
        }
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 120px;
        }
        .info-value {
          flex: 1;
        }
        .results-section {
          margin-top: 30px;
        }
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .results-table th, .results-table td {
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }
        .results-table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .category-header {
          background-color: #f9f9f9;
          font-weight: bold;
          padding: 8px;
          margin-top: 15px;
          margin-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        .test-name {
          font-weight: bold;
          padding: 8px;
          background-color: #f5f5f5;
        }
        .normal {
          color: #065f46;
        }
        .abnormal {
          color: #dc2626;
        }
        .footer {
          margin-top: 50px;
          padding-top: 10px;
          border-top: 5px solid;
          border-image: linear-gradient(to right, 
            #FF0000 0%, #FF0000 33%, 
            #0000FF 33%, #0000FF 66%, 
            #008000 66%, #008000 100%) 1;
          font-size: 14px;
          color: #0000FF;
          text-align: center;
          font-weight: bold;
        }
        .hospital-address {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 5px;
        }
        .print-date {
          font-size: 12px;
          color: #6b7280;
          text-align: right;
          margin-top: 20px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-container {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="lab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-microscope" style="color: white;">
              <path d="M6 18h8"></path>
              <path d="M3 22h18"></path>
              <path d="M14 22a7 7 0 1 0 0-14h-1"></path>
              <path d="M9 14h2"></path>
              <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path>
              <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path>
            </svg>
          </div>
          <div class="lab-report-title">Lab Report</div>
          ${hospitalLogo ? `
          <div class="logo-container">
            <img class="logo" src="${hospitalLogo}" alt="Hospital Logo">
          </div>
          ` : ''}
        </div>
        
        <div class="color-line"></div>
        
        <div class="patient-info">
          <div class="info-row">
            <div class="info-label">Patient Name:</div>
            <div class="info-value">${reportData.patientName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Patient ID:</div>
            <div class="info-value">${reportData.patientId}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Gender:</div>
            <div class="info-value">${reportData.patientGender}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Doctor:</div>
            <div class="info-value">${reportData.referringDoctor || 'Dr. Not Specified'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Age:</div>
            <div class="info-value">${reportData.patientAge} years</div>
          </div>
        </div>
        
        <div class="results-section">
          <table class="results-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.testCategory ? `
                <tr>
                  <td colspan="4" class="category-header">${reportData.testCategory}</td>
                </tr>
              ` : ''}
              
              <tr>
                <td colspan="4" class="test-name">${reportData.testName}</td>
              </tr>
              
              ${reportData.results.map(result => `
                <tr>
                  <td>${result.parameterName}</td>
                  <td class="${result.isNormal ? 'normal' : 'abnormal'}">${result.value}</td>
                  <td>${result.normalRange}</td>
                  <td>${result.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${reportData.notes ? `
        <div style="margin-top: 20px;">
          <strong>Notes:</strong>
          <div>${reportData.notes}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          ${hospitalName.toUpperCase()}
          <div class="hospital-address">${hospitalAddress}</div>
        </div>
        
        <div class="print-date">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  // Write the HTML content to the new window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

// Function to generate and print an invoice
export const generateInvoice = (invoiceData: InvoiceData) => {
  if (Platform.OS !== 'web') {
    console.log('Print functionality is only available on web');
    return;
  }

  // Format date
  const formattedDate = new Date(invoiceData.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window. Please check if pop-ups are blocked.');
    return;
  }

  // Get hospital details from the passed data with fallbacks
  const hospitalName = invoiceData.hospitalDetails?.name || 'Medical Laboratory';
  const hospitalAddress = invoiceData.hospitalDetails?.address || '';
  const hospitalPhone = invoiceData.hospitalDetails?.phone || '';
  const hospitalEmail = invoiceData.hospitalDetails?.email || '';
  const hospitalLogo = invoiceData.hospitalDetails?.logo || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=200&auto=format&fit=crop';
  const hospitalFooter = invoiceData.hospitalDetails?.footer || 'Thank you for choosing our services.';

  // HTML content for the invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invoiceData.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e0e0e0;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          color: #4A6FA5;
        }
        .logo-container {
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .logo {
          max-width: 100%;
          max-height: 100%;
        }
        .hospital-info {
          text-align: center;
          margin-bottom: 20px;
        }
        .hospital-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .hospital-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .hospital-contact {
          font-size: 14px;
          color: #666;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        .invoice-details-left, .invoice-details-right {
          flex: 1;
        }
        .detail-row {
          margin-bottom: 8px;
        }
        .detail-label {
          font-weight: bold;
          margin-right: 10px;
        }
        .patient-info {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #4A6FA5;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .items-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          margin-bottom: 5px;
        }
        .total-label {
          font-weight: bold;
          margin-right: 20px;
        }
        .total-value {
          font-weight: bold;
          color: #4A6FA5;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .payment-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-overdue {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-container {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="invoice-title">INVOICE</div>
          ${hospitalLogo ? `
          <div class="logo-container">
            <img class="logo" src="${hospitalLogo}" alt="Hospital Logo">
          </div>
          ` : ''}
        </div>
        
        <div class="hospital-info">
          <div class="hospital-name">${hospitalName}</div>
          <div class="hospital-address">${hospitalAddress}</div>
          <div class="hospital-contact">Phone: ${hospitalPhone}</div>
          ${hospitalEmail ? `<div class="hospital-contact">Email: ${hospitalEmail}</div>` : ''}
        </div>
        
        <div class="invoice-details">
          <div class="invoice-details-left">
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span>${invoiceData.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span>${invoiceData.paymentMethod || 'Not specified'}</span>
            </div>
          </div>
          <div class="invoice-details-right">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="payment-status ${
                invoiceData.status === 'Paid' ? 'status-paid' : 
                invoiceData.status === 'Pending' ? 'status-pending' : 'status-overdue'
              }">${invoiceData.status}</span>
            </div>
          </div>
        </div>
        
        <div class="patient-info">
          <div class="section-title">Patient Information</div>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span>${invoiceData.patientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Patient ID:</span>
            <span>${invoiceData.patientId}</span>
          </div>
        </div>
        
        <div class="section-title">Tests</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Test Description</th>
              <th>Code</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.tests.map(test => `
              <tr>
                <td>${test.name || 'Unknown Test'}</td>
                <td>${test.id || ''}</td>
                <td>₹${(test.price || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span>₹${invoiceData.totalAmount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Total:</span>
            <span class="total-value">₹${invoiceData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          ${hospitalFooter}
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  // Write the HTML content to the new window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};