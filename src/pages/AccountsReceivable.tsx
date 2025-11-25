import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  Clock,
  AlertCircle,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getCustomers } from '@/lib/accounts/customers';
import { getSuppliers } from '@/lib/accounts/suppliers';

interface Customer {
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

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  rif_ci: string;
  payment_terms_days: number;
  bank: string;
  bank_account?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountReceivable {
  id: string;
  invoice_number: string;
  customer_id?: string;
  supplier_id?: string;
  customer_name?: string;
  supplier_name?: string;
  entity_type: 'customer' | 'supplier';
  entity_name: string;
  amount: number;
  currency: 'USD' | 'VES';
  due_date: string;
  status: 'pending' | 'overdue' | 'paid' | 'cancelled';
  description?: string;
  payment_terms: number;
  created_at: string;
  updated_at: string;
}

const PAYMENT_TERMS_OPTIONS = [
  { value: 15, label: '15 días' },
  { value: 30, label: '30 días' },
  { value: 45, label: '45 días' },
  { value: 60, label: '60 días' },
  { value: 90, label: '90 días' }
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - Dólar Estadounidense', symbol: '$' },
  { value: 'VES', label: 'VES - Bolívar Venezolano', symbol: 'Bs.' }
];

export default function AccountsReceivable() {
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<AccountReceivable | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    invoice_number: '',
    entity_type: 'customer' as 'customer' | 'supplier',
    customer_id: '',
    supplier_id: '',
    amount: 0,
    currency: 'USD' as 'USD' | 'VES',
    payment_terms: 30,
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load customers and suppliers
      const [customersData, suppliersData] = await Promise.all([
        getCustomers(),
        getSuppliers()
      ]);
      
      setCustomers(customersData);
      setSuppliers(suppliersData);
      
      // Debug logging
      console.log('🔍 DEBUG - Customers loaded:', customersData.length, customersData);
      console.log('🔍 DEBUG - Suppliers loaded:', suppliersData.length, suppliersData);
      
      // Create sample suppliers if none exist
      if (suppliersData.length === 0) {
        console.log('⚠️ No suppliers found, creating sample data...');
        const sampleSuppliers = [
          {
            id: 'supplier-1',
            name: 'Proveedor Ejemplo 1',
            email: 'proveedor1@example.com',
            phone: '+58-412-1234567',
            address: 'Caracas, Venezuela',
            rif_ci: 'J-12345678-9',
            payment_terms_days: 30,
            bank: 'Banco Venezuela',
            bank_account: '0102-1234-56-1234567890',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'supplier-2',
            name: 'Proveedor Ejemplo 2',
            email: 'proveedor2@example.com',
            phone: '+58-414-7654321',
            address: 'Valencia, Venezuela',
            rif_ci: 'J-87654321-0',
            payment_terms_days: 15,
            bank: 'Banco Nacional',
            bank_account: '0108-9876-54-0987654321',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('sales-app-suppliers', JSON.stringify(sampleSuppliers));
        setSuppliers(sampleSuppliers);
        console.log('✅ Sample suppliers created:', sampleSuppliers.length);
      }
      
      // Load receivables from localStorage
      loadReceivables();
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const loadReceivables = () => {
    try {
      const savedReceivables = localStorage.getItem('sales-app-receivables');
      if (savedReceivables) {
        const parsedReceivables = JSON.parse(savedReceivables);
        setReceivables(parsedReceivables);
        console.log('✅ Receivables loaded:', parsedReceivables.length);
      }
    } catch (error) {
      console.error('Error loading receivables:', error);
      setReceivables([]);
    }
  };

  const saveToLocalStorage = (receivablesData: AccountReceivable[]) => {
    try {
      localStorage.setItem('sales-app-receivables', JSON.stringify(receivablesData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      entity_type: 'customer',
      customer_id: '',
      supplier_id: '',
      amount: 0,
      currency: 'USD',
      payment_terms: 30,
      description: ''
    });
    setSelectedReceivable(null);
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const calculateDueDate = (paymentTerms: number) => {
    const now = new Date();
    const dueDate = new Date(now.getTime() + paymentTerms * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  };

  const validateForm = (): boolean => {
    if (!formData.invoice_number.trim()) {
      toast.error('El número de factura es obligatorio');
      return false;
    }
    
    if (formData.entity_type === 'customer' && !formData.customer_id) {
      toast.error('Debe seleccionar un cliente');
      return false;
    }
    
    if (formData.entity_type === 'supplier' && !formData.supplier_id) {
      toast.error('Debe seleccionar un proveedor');
      return false;
    }
    
    if (formData.amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }
    
    return true;
  };

  const getEntityInfo = () => {
    if (formData.entity_type === 'customer' && formData.customer_id) {
      return customers.find(c => c.id === formData.customer_id);
    } else if (formData.entity_type === 'supplier' && formData.supplier_id) {
      return suppliers.find(s => s.id === formData.supplier_id);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const entityInfo = getEntityInfo();
      if (!entityInfo) {
        toast.error('Entidad no encontrada');
        return;
      }

      const now = new Date().toISOString();
      const dueDate = calculateDueDate(formData.payment_terms);
      
      if (selectedReceivable) {
        // Update existing receivable
        const updatedReceivable: AccountReceivable = {
          ...selectedReceivable,
          invoice_number: formData.invoice_number,
          entity_type: formData.entity_type,
          customer_id: formData.entity_type === 'customer' ? formData.customer_id : undefined,
          supplier_id: formData.entity_type === 'supplier' ? formData.supplier_id : undefined,
          entity_name: entityInfo.name,
          customer_name: formData.entity_type === 'customer' ? entityInfo.name : undefined,
          supplier_name: formData.entity_type === 'supplier' ? entityInfo.name : undefined,
          amount: formData.amount,
          currency: formData.currency,
          payment_terms: formData.payment_terms,
          due_date: dueDate,
          description: formData.description,
          updated_at: now
        };
        
        const updatedReceivables = receivables.map(receivable =>
          receivable.id === selectedReceivable.id ? updatedReceivable : receivable
        );
        
        setReceivables(updatedReceivables);
        saveToLocalStorage(updatedReceivables);
        toast.success('Factura actualizada exitosamente');
        setIsEditDialogOpen(false);
      } else {
        // Create new receivable
        const newReceivable: AccountReceivable = {
          id: crypto.randomUUID(),
          invoice_number: formData.invoice_number,
          entity_type: formData.entity_type,
          customer_id: formData.entity_type === 'customer' ? formData.customer_id : undefined,
          supplier_id: formData.entity_type === 'supplier' ? formData.supplier_id : undefined,
          entity_name: entityInfo.name,
          customer_name: formData.entity_type === 'customer' ? entityInfo.name : undefined,
          supplier_name: formData.entity_type === 'supplier' ? entityInfo.name : undefined,
          amount: formData.amount,
          currency: formData.currency,
          payment_terms: formData.payment_terms,
          due_date: dueDate,
          status: 'pending',
          description: formData.description,
          created_at: now,
          updated_at: now
        };
        
        const updatedReceivables = [...receivables, newReceivable];
        setReceivables(updatedReceivables);
        saveToLocalStorage(updatedReceivables);
        toast.success('Factura creada exitosamente');
        setIsCreateDialogOpen(false);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving receivable:', error);
      toast.error('Error al guardar la factura');
    }
  };

  const handleEdit = (receivable: AccountReceivable) => {
    setSelectedReceivable(receivable);
    setFormData({
      invoice_number: receivable.invoice_number,
      entity_type: receivable.entity_type,
      customer_id: receivable.customer_id || '',
      supplier_id: receivable.supplier_id || '',
      amount: receivable.amount,
      currency: receivable.currency,
      payment_terms: receivable.payment_terms,
      description: receivable.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      return;
    }

    try {
      const updatedReceivables = receivables.filter(receivable => receivable.id !== id);
      setReceivables(updatedReceivables);
      saveToLocalStorage(updatedReceivables);
      toast.success('Factura eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting receivable:', error);
      toast.error('Error al eliminar la factura');
    }
  };

  const handleMarkAsPaid = (id: string) => {
    try {
      const updatedReceivables = receivables.map(receivable =>
        receivable.id === id 
          ? { ...receivable, status: 'paid' as const, updated_at: new Date().toISOString() }
          : receivable
      );
      setReceivables(updatedReceivables);
      saveToLocalStorage(updatedReceivables);
      toast.success('Factura marcada como pagada');
    } catch (error) {
      console.error('Error updating receivable:', error);
      toast.error('Error al actualizar la factura');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    return CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol || '$';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  // Update status for overdue invoices
  useEffect(() => {
    const updatedReceivables = receivables.map(receivable => {
      if (receivable.status === 'pending' && isOverdue(receivable.due_date)) {
        return { ...receivable, status: 'overdue' as const };
      }
      return receivable;
    });
    
    if (JSON.stringify(updatedReceivables) !== JSON.stringify(receivables)) {
      setReceivables(updatedReceivables);
      saveToLocalStorage(updatedReceivables);
    }
  }, [receivables]);

  const filteredReceivables = receivables.filter(receivable => {
    const matchesSearch = 
      receivable.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || receivable.status === statusFilter;
    const matchesCurrency = currencyFilter === 'all' || receivable.currency === currencyFilter;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const totalPendingUSD = receivables
    .filter(r => (r.status === 'pending' || r.status === 'overdue') && r.currency === 'USD')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPendingVES = receivables
    .filter(r => (r.status === 'pending' || r.status === 'overdue') && r.currency === 'VES')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOverdueUSD = receivables
    .filter(r => r.status === 'overdue' && r.currency === 'USD')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOverdueVES = receivables
    .filter(r => r.status === 'overdue' && r.currency === 'VES')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">
            Cuentas por Cobrar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona las facturas pendientes de pago de clientes y proveedores
          </p>
          {/* Debug Info */}
          <div className="mt-2 text-sm text-gray-500">
            🔍 Debug: {customers.length} clientes, {suppliers.length} proveedores cargados
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flowi-button"
              onClick={() => {
                resetForm();
                setFormData(prev => ({ ...prev, invoice_number: generateInvoiceNumber() }));
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedReceivable ? 'Editar Factura' : 'Nueva Factura'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Número de Factura *</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="INV-20240101-001"
                    required
                    className="flowi-input"
                  />
                </div>

                {/* Entity Type */}
                <div className="space-y-2">
                  <Label htmlFor="entity_type">Tipo de Entidad *</Label>
                  <Select 
                    value={formData.entity_type} 
                    onValueChange={(value: 'customer' | 'supplier') => {
                      console.log('🔍 Entity type changed to:', value);
                      setFormData({ 
                        ...formData, 
                        entity_type: value,
                        customer_id: '',
                        supplier_id: ''
                      });
                    }}
                  >
                    <SelectTrigger className="flowi-input">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Cliente
                        </div>
                      </SelectItem>
                      <SelectItem value="supplier">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Proveedor
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Selection */}
                <div className="space-y-2">
                  <Label htmlFor="entity_id">
                    {formData.entity_type === 'customer' ? 'Cliente' : 'Proveedor'} *
                  </Label>
                  <Select 
                    value={formData.entity_type === 'customer' ? formData.customer_id : formData.supplier_id} 
                    onValueChange={(value) => {
                      console.log('🔍 Entity selected:', value, 'for type:', formData.entity_type);
                      if (formData.entity_type === 'customer') {
                        setFormData({ ...formData, customer_id: value });
                      } else {
                        setFormData({ ...formData, supplier_id: value });
                      }
                    }}
                  >
                    <SelectTrigger className="flowi-input">
                      <SelectValue placeholder={`Seleccionar ${formData.entity_type === 'customer' ? 'cliente' : 'proveedor'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.entity_type === 'customer' ? (
                        customers.length === 0 ? (
                          <SelectItem value="no-customers" disabled>
                            No hay clientes registrados
                          </SelectItem>
                        ) : (
                          customers
                            .filter(customer => customer.isActive)
                            .map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} {customer.email && `(${customer.email})`}
                              </SelectItem>
                            ))
                        )
                      ) : (
                        suppliers.length === 0 ? (
                          <SelectItem value="no-suppliers" disabled>
                            No hay proveedores registrados
                          </SelectItem>
                        ) : (
                          suppliers
                            .filter(supplier => supplier.is_active !== false)
                            .map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name} {supplier.rif_ci && `(${supplier.rif_ci})`}
                              </SelectItem>
                            ))
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {((formData.entity_type === 'customer' && customers.length === 0) || 
                    (formData.entity_type === 'supplier' && suppliers.length === 0)) && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ No hay {formData.entity_type === 'customer' ? 'clientes' : 'proveedores'} registrados. 
                      Ve a la sección {formData.entity_type === 'customer' ? 'Clientes' : 'Proveedores'} para agregar uno.
                    </p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value: 'USD' | 'VES') => {
                      console.log('🔍 Currency changed to:', value);
                      setFormData({ ...formData, currency: value });
                    }}
                  >
                    <SelectTrigger className="flowi-input">
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{currency.symbol}</span>
                            {currency.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto ({getCurrencySymbol(formData.currency)}) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                    className="flowi-input"
                  />
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Términos de Pago *</Label>
                  <Select 
                    value={formData.payment_terms.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, payment_terms: parseInt(value) })}
                  >
                    <SelectTrigger className="flowi-input">
                      <SelectValue placeholder="Seleccionar términos" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de los productos o servicios facturados"
                  className="flowi-input"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flowi-button">
                  {selectedReceivable ? 'Actualizar' : 'Crear'} Factura
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FuturisticCard variant="glass" className="p-6 flowi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-flowi">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {receivables.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Facturas
              </p>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FuturisticCard variant="glass" className="p-6 flowi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-flowi">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                ${totalPendingUSD.toFixed(2)} USD
              </h3>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Bs. {totalPendingVES.toFixed(2)} VES
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Pendiente
              </p>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FuturisticCard variant="glass" className="p-6 flowi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-flowi">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                ${totalOverdueUSD.toFixed(2)} USD
              </h3>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Bs. {totalOverdueVES.toFixed(2)} VES
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Vencido
              </p>
            </div>
          </FuturisticCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FuturisticCard variant="glass" className="p-6 flowi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-flowi">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {customers.filter(c => c.isActive).length + suppliers.filter(s => s.is_active !== false).length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Entidades Activas
              </p>
            </div>
          </FuturisticCard>
        </motion.div>
      </div>

      {/* Filters */}
      <FuturisticCard variant="glass" className="p-6 flowi-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              
              <Input
                placeholder="Buscar por número de factura, entidad o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 flowi-input"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 flowi-input">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-32 flowi-input">
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="VES">VES</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FuturisticCard>

      {/* Receivables List */}
      <FuturisticCard variant="glass" className="p-6 flowi-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando facturas...</p>
          </div>
        ) : filteredReceivables.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || currencyFilter !== 'all'
                ? 'No se encontraron facturas que coincidan con los filtros' 
                : 'No hay facturas registradas'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReceivables.map((receivable, index) => (
              <motion.div
                key={receivable.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border hover:border-orange-400/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {receivable.invoice_number}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {receivable.entity_type === 'customer' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        <span>{receivable.entity_name}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
                          {receivable.entity_type === 'customer' ? 'Cliente' : 'Proveedor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusBadgeColor(receivable.status)} text-xs`}>
                      {getStatusLabel(receivable.status)}
                    </Badge>
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {getCurrencySymbol(receivable.currency)}{receivable.amount.toFixed(2)} {receivable.currency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fecha de creación:</span>
                    <p className="font-medium">
                      {new Date(receivable.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fecha de vencimiento:</span>
                    <p className={`font-medium ${isOverdue(receivable.due_date) && receivable.status === 'pending' ? 'text-red-600' : ''}`}>
                      {new Date(receivable.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Términos:</span>
                    <p className="font-medium">{receivable.payment_terms} días</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Moneda:</span>
                    <p className="font-medium">{receivable.currency}</p>
                  </div>
                </div>

                {receivable.description && (
                  <div className="mb-4">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Descripción:</span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                      {receivable.description}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {receivable.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsPaid(receivable.id)}
                      className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Marcar como Pagada
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(receivable)}
                    className="text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(receivable.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </FuturisticCard>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Factura</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="edit_invoice_number">Número de Factura *</Label>
                <Input
                  id="edit_invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="INV-20240101-001"
                  required
                  className="flowi-input"
                />
              </div>

              {/* Entity Type */}
              <div className="space-y-2">
                <Label htmlFor="edit_entity_type">Tipo de Entidad *</Label>
                <Select 
                  value={formData.entity_type} 
                  onValueChange={(value: 'customer' | 'supplier') => {
                    setFormData({ 
                      ...formData, 
                      entity_type: value,
                      customer_id: '',
                      supplier_id: ''
                    });
                  }}
                >
                  <SelectTrigger className="flowi-input">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cliente
                      </div>
                    </SelectItem>
                    <SelectItem value="supplier">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Proveedor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entity Selection */}
              <div className="space-y-2">
                <Label htmlFor="edit_entity_id">
                  {formData.entity_type === 'customer' ? 'Cliente' : 'Proveedor'} *
                </Label>
                <Select 
                  value={formData.entity_type === 'customer' ? formData.customer_id : formData.supplier_id} 
                  onValueChange={(value) => {
                    if (formData.entity_type === 'customer') {
                      setFormData({ ...formData, customer_id: value });
                    } else {
                      setFormData({ ...formData, supplier_id: value });
                    }
                  }}
                >
                  <SelectTrigger className="flowi-input">
                    <SelectValue placeholder={`Seleccionar ${formData.entity_type === 'customer' ? 'cliente' : 'proveedor'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.entity_type === 'customer' ? (
                      customers
                        .filter(customer => customer.isActive)
                        .map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.email && `(${customer.email})`}
                          </SelectItem>
                        ))
                    ) : (
                      suppliers
                        .filter(supplier => supplier.is_active !== false)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.rif_ci && `(${supplier.rif_ci})`}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="edit_currency">Moneda *</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value: 'USD' | 'VES') => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="flowi-input">
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{currency.symbol}</span>
                          {currency.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="edit_amount">Monto ({getCurrencySymbol(formData.currency)}) *</Label>
                <Input
                  id="edit_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="flowi-input"
                />
              </div>

              {/* Payment Terms */}
              <div className="space-y-2">
                <Label htmlFor="edit_payment_terms">Términos de Pago *</Label>
                <Select 
                  value={formData.payment_terms.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, payment_terms: parseInt(value) })}
                >
                  <SelectTrigger className="flowi-input">
                    <SelectValue placeholder="Seleccionar términos" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit_description">Descripción (opcional)</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de los productos o servicios facturados"
                className="flowi-input"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flowi-button">
                Actualizar Factura
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}