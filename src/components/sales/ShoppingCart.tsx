import { FuturisticCard } from '@/components/ui/futuristic-card';
import { Button } from '@/components/ui/button';
import { ShoppingCart as ShoppingCartIcon, Trash2, Plus, Minus, Calculator } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  priceUSD: number;
  priceVES: number;
}

interface ShoppingCartProps {
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOpenProcessDialog: () => void;
  totalUSD: number;
  totalVES: number;
}

export function ShoppingCart({ 
  cart, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  onOpenProcessDialog,
  totalUSD,
  totalVES 
}: ShoppingCartProps) {
  return (
    <div className="space-y-6">
      <FuturisticCard variant="glass" className="p-6 light-card">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Carrito de Compras</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Carrito vacío</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">{item.productName}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromCart(item.productId)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-gray-800 dark:text-gray-200 font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right text-xs">
                    <div className="text-green-600 font-medium">${(item.priceUSD * item.quantity).toFixed(2)}</div>
                    <div className="text-blue-600 font-medium">Bs. {(item.priceVES * item.quantity).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total USD:</span>
                  <span className="text-green-600 font-bold">${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total VES:</span>
                  <span className="text-blue-600 font-bold">Bs. {totalVES.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                onClick={onOpenProcessDialog}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Procesar Venta
              </Button>
            </div>
          </div>
        )}
      </FuturisticCard>
    </div>
  );
}