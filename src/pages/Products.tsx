import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/context/SupabaseContext';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Product } from '@/types';
import { formatVES, formatUSD, exchangeRateManager } from '@/lib/exchange-rate';

// Low stock threshold
const LOW_STOCK_THRESHOLD = 5;

export default function Products() {
  const { state, addProduct, updateProduct, deleteProduct } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [loading, setLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    priceUSD: 0,
    priceVES: 0,
    stock: 0,
    reorderLevel: 5,
    image: ''
  });

  // Get current exchange rate
  const currentExchangeRate = exchangeRateManager.getCurrentRate();
  const usdToVesRate = currentExchangeRate?.usdToVes || 36.50;

  // Calculate inventory metrics using real product data
  const inventoryMetrics = useMemo(() => {
    const products = state.products || [];
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    
    // Calculate total inventory value in USD
    const totalInventoryValueUSD = products.reduce((sum, p) => sum + (p.priceUSD * p.stock), 0);
    
    // Convert to VES using current exchange rate
    const totalInventoryValueVES = totalInventoryValueUSD * usdToVesRate;
    
    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValueUSD,
      totalInventoryValueVES,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length
    };
  }, [state.products, usdToVesRate]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    const products = state.products || [];
    
    if (!searchTerm) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [state.products, searchTerm]);

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      priceUSD: 0,
      priceVES: 0,
      stock: 0,
      reorderLevel: 5,
      image: ''
    });
    setSelectedProduct(null);
  };

  // CRITICAL FIX: Use context functions instead of dispatch
  const handleCreateProduct = async () => {
    if (!productForm.name) {
      toast.error('El nombre del producto es requerido');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔍 DEBUGGING - Datos del formulario antes de enviar:', productForm);
      console.log('🔍 DEBUGGING - priceVES del formulario:', productForm.priceVES, 'tipo:', typeof productForm.priceVES);
      
      // Calculate VES price if not provided
      const vesPrice = productForm.priceVES || (productForm.priceUSD * usdToVesRate);
      
      console.log('🔍 DEBUGGING - vesPrice calculado:', vesPrice, 'tipo:', typeof vesPrice);
      
      const productData = {
        name: productForm.name,
        description: productForm.description,
        priceUSD: productForm.priceUSD,
        priceVES: vesPrice,
        stock: productForm.stock,
        reorderLevel: productForm.reorderLevel,
        image: productForm.image
      };

      console.log('🔍 DEBUGGING - Datos finales enviados a addProduct:', productData);

      // CRITICAL FIX: Use context function instead of dispatch
      await addProduct(productData);

      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Producto creado exitosamente');
    } catch (error) {
      toast.error('Error creando producto');
      console.error('❌ Error en handleCreateProduct:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log('🔍 DEBUGGING - Producto seleccionado para editar:', product);
    console.log('🔍 DEBUGGING - priceVES del producto:', product.priceVES, 'tipo:', typeof product.priceVES);
    
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      priceUSD: product.priceUSD,
      priceVES: product.priceVES,
      stock: product.stock,
      reorderLevel: product.reorderLevel || 5,
      image: product.image || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      
      console.log('🔍 DEBUGGING - Datos del formulario antes de actualizar:', productForm);
      console.log('🔍 DEBUGGING - priceVES del formulario:', productForm.priceVES, 'tipo:', typeof productForm.priceVES);
      
      // Calculate VES price if not provided
      const vesPrice = productForm.priceVES || (productForm.priceUSD * usdToVesRate);
      
      console.log('🔍 DEBUGGING - vesPrice calculado para actualización:', vesPrice, 'tipo:', typeof vesPrice);
      
      const updatedProduct: Product = {
        ...selectedProduct,
        name: productForm.name,
        description: productForm.description,
        priceUSD: productForm.priceUSD,
        priceVES: vesPrice,
        stock: productForm.stock,
        reorderLevel: productForm.reorderLevel,
        image: productForm.image,
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 DEBUGGING - Producto final para actualizar:', updatedProduct);

      // CRITICAL FIX: Use context function instead of dispatch
      await updateProduct(updatedProduct);

      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      toast.error('Error actualizando producto');
      console.error('❌ Error en handleUpdateProduct:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // CRITICAL FIX: Use context function instead of dispatch
      await deleteProduct(product.id);

      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      toast.error('Error eliminando producto');
      console.error('❌ Error en handleDeleteProduct:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    if (stock <= LOW_STOCK_THRESHOLD) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Sin Stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'Stock Bajo';
    return 'En Stock';
  };

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
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra productos, stock y categorías
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrices(!showPrices)}
            className="gap-2"
          >
            {showPrices ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPrices ? 'Ocultar' : 'Mostrar'} Precios
          </Button>
        </div>
      </motion.div>

      {/* Inventory Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FuturisticCard variant="glass" className="p-6 flowi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-flowi">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {inventoryMetrics.totalProducts}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Productos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {inventoryMetrics.activeProducts} con stock
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-flowi">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {showPrices ? formatUSD(inventoryMetrics.totalInventoryValueUSD) : '****'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Valor Inventario USD
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {showPrices ? formatVES(inventoryMetrics.totalInventoryValueVES) : '****'}
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-flowi">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {inventoryMetrics.lowStockCount}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Stock Bajo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                ≤ {LOW_STOCK_THRESHOLD} unidades
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-flowi">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {inventoryMetrics.outOfStockCount}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Sin Stock
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Requiere reposición
              </p>
            </div>
          </FuturisticCard>
        </motion.div>
      </div>

      {/* Stock Alerts */}
      {(inventoryMetrics.lowStockCount > 0 || inventoryMetrics.outOfStockCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {inventoryMetrics.outOfStockCount > 0 && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>¡Atención!</strong> Tienes {inventoryMetrics.outOfStockCount} producto{inventoryMetrics.outOfStockCount > 1 ? 's' : ''} sin stock.
                <div className="mt-2 flex flex-wrap gap-2">
                  {inventoryMetrics.outOfStockProducts.slice(0, 5).map(product => (
                    <Badge key={product.id} variant="destructive" className="text-xs">
                      {product.name}
                    </Badge>
                  ))}
                  {inventoryMetrics.outOfStockProducts.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{inventoryMetrics.outOfStockProducts.length - 5} más
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {inventoryMetrics.lowStockCount > 0 && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>Stock Bajo:</strong> {inventoryMetrics.lowStockCount} producto{inventoryMetrics.lowStockCount > 1 ? 's' : ''} con stock menor a {LOW_STOCK_THRESHOLD} unidades.
                <div className="mt-2 flex flex-wrap gap-2">
                  {inventoryMetrics.lowStockProducts.slice(0, 5).map(product => (
                    <Badge key={product.id} className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 text-xs">
                      {product.name} ({product.stock})
                    </Badge>
                  ))}
                  {inventoryMetrics.lowStockProducts.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{inventoryMetrics.lowStockProducts.length - 5} más
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md flowi-button">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Producto *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: iPhone 15 Pro"
                    className="flowi-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Stock Inicial</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="flowi-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio USD</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.priceUSD}
                    onChange={(e) => setProductForm(prev => ({ ...prev, priceUSD: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="flowi-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio VES (opcional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.priceVES}
                    onChange={(e) => setProductForm(prev => ({ ...prev, priceVES: parseFloat(e.target.value) || 0 }))}
                    placeholder={`Auto: ${(productForm.priceUSD * usdToVesRate).toFixed(2)}`}
                    className="flowi-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nivel de Reorden</Label>
                  <Input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm(prev => ({ ...prev, reorderLevel: parseInt(e.target.value) || 5 }))}
                    placeholder="5"
                    className="flowi-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL de Imagen</Label>
                  <Input
                    value={productForm.image}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..."
                    className="flowi-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada del producto"
                  className="flowi-input"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  className="flex-1 flowi-button"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Producto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <FuturisticCard variant="glass" className="p-6 flowi-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flowi-input"
              />
            </div>
          </div>
        </div>
      </FuturisticCard>

      {/* Products Grid */}
      <FuturisticCard variant="glass" className="p-6 flowi-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border hover:border-orange-400/50 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  
                  <Badge className={`${getStockStatusColor(product.stock)} text-xs ml-2`}>
                    {getStockStatusText(product.stock)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className={`font-bold ${product.stock <= LOW_STOCK_THRESHOLD ? 'text-orange-600' : 'text-green-600'}`}>
                      {product.stock} unidades
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio USD:</span>
                    <span className="font-bold text-green-600">
                      {showPrices ? formatUSD(product.priceUSD) : '****'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio VES:</span>
                    <span className="font-bold text-orange-600">
                      {showPrices ? formatVES(product.priceVES) : '****'}
                    </span>
                  </div>

                  {product.reorderLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reorden:</span>
                      <span className="text-xs">{product.reorderLevel} unidades</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product)}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Producto *</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: iPhone 15 Pro"
                  className="flowi-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="flowi-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Precio USD</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.priceUSD}
                  onChange={(e) => setProductForm(prev => ({ ...prev, priceUSD: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="flowi-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Precio VES</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.priceVES}
                  onChange={(e) => setProductForm(prev => ({ ...prev, priceVES: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="flowi-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Nivel de Reorden</Label>
                <Input
                  type="number"
                  value={productForm.reorderLevel}
                  onChange={(e) => setProductForm(prev => ({ ...prev, reorderLevel: parseInt(e.target.value) || 5 }))}
                  placeholder="5"
                  className="flowi-input"
                />
              </div>

              <div className="space-y-2">
                <Label>URL de Imagen</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="flowi-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada del producto"
                className="flowi-input"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateProduct}
                className="flex-1 flowi-button"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Producto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}