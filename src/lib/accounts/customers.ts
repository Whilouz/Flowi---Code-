// Customer management for accounts receivable
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit: number;
  paymentTerms: number;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountsReceivableEntry {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  currency: 'USD' | 'VES';
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample customers data
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'Empresa ABC C.A.',
    email: 'contacto@empresaabc.com',
    phone: '+58-212-555-0001',
    address: 'Av. Francisco de Miranda, Caracas',
    taxId: 'J-12345678-9',
    creditLimit: 5000,
    paymentTerms: 30,
    isActive: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Comercial XYZ',
    email: 'ventas@comercialxyz.com',
    phone: '+58-261-555-0002',
    address: 'Centro Comercial, Maracaibo',
    taxId: 'J-98765432-1',
    creditLimit: 3000,
    paymentTerms: 15,
    isActive: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Main function that AccountsReceivable.tsx is trying to import
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    // Try to load from localStorage first
    const saved = localStorage.getItem('flowi-customers');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('✅ Customers loaded from localStorage:', parsed.length);
      return parsed;
    }
    
    // If no saved data, return sample customers and save them
    console.log('📝 No customers found, creating sample data...');
    localStorage.setItem('flowi-customers', JSON.stringify(sampleCustomers));
    return [...sampleCustomers];
  } catch (error) {
    console.error('❌ Error loading customers:', error);
    return [...sampleCustomers];
  }
};

export const saveCustomers = (customers: Customer[]): void => {
  try {
    localStorage.setItem('flowi-customers', JSON.stringify(customers));
    console.log('✅ Customers saved to localStorage:', customers.length);
  } catch (error) {
    console.error('❌ Error saving customers:', error);
  }
};

export const getAccountsReceivable = (): AccountsReceivableEntry[] => {
  try {
    const saved = localStorage.getItem('flowi-accounts-receivable');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error('Error loading accounts receivable:', error);
    return [];
  }
};

export const saveAccountsReceivable = (entries: AccountsReceivableEntry[]): void => {
  try {
    localStorage.setItem('flowi-accounts-receivable', JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving accounts receivable:', error);
  }
};

export const getCustomerById = (id: string): Customer | undefined => {
  try {
    const customers = JSON.parse(localStorage.getItem('flowi-customers') || '[]');
    return customers.find((customer: Customer) => customer.id === id);
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return sampleCustomers.find(customer => customer.id === id);
  }
};

export const getOverdueEntries = (): AccountsReceivableEntry[] => {
  const entries = getAccountsReceivable();
  const now = new Date();
  return entries.filter(entry => 
    entry.status === 'pending' && new Date(entry.dueDate) < now
  );
};

export const getTotalReceivableAmount = (): { USD: number; VES: number } => {
  const entries = getAccountsReceivable();
  const pending = entries.filter(entry => entry.status === 'pending' || entry.status === 'overdue');
  
  return pending.reduce(
    (totals, entry) => {
      if (entry.currency === 'USD') {
        totals.USD += entry.amount;
      } else {
        totals.VES += entry.amount;
      }
      return totals;
    },
    { USD: 0, VES: 0 }
  );
};

export const formatCurrency = (amount: number, currency: 'USD' | 'VES'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  } else {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
  }
};

export const getStatusColor = (status: AccountsReceivableEntry['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'overdue':
      return 'text-red-600 bg-red-100';
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status: AccountsReceivableEntry['status']): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'overdue':
      return 'Vencido';
    case 'paid':
      return 'Pagado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};