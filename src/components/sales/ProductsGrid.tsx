import { motion } from 'framer-motion';
import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { Product } from '@/types';

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export function ProductsGrid({ products, onAddToCart }: ProductsGridProps) {
  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <div className="lg:col-span-2 space-y-6">
      <FuturisticCard variant="glass" className="p-6 light-card">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Productos Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border hover:border-orange-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => onAddToCart(product.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{product.name}</h3>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 text-xs font-medium">
                  {product.stock} disponibles
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">${product.priceUSD}</span>
                </div>
                <div className="text-blue-600 text-sm">
                  Bs. {product.priceVES.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </FuturisticCard>
    </div>
  );
}