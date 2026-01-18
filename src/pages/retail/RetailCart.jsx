import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const RetailCart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, updateItemQuantity, removeItem, getCartTotal, clearCart, recalculateCart } = useCartStore();
  const { getProductById } = useProductStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to view your cart');
      navigate('/retail-access');
    }
  }, [isAuthenticated, navigate]);

  // Recalculate cart totals on mount to fix any cached items with 0 prices
  React.useEffect(() => {
    if (items.length > 0) {
      recalculateCart();
    }
  }, []); // Only run on mount

  const handleUpdateQuantity = (itemId, productId, newQty) => {
    const product = getProductById(productId);
    if (!product) return;
    
    const minQty = product.minOrderQty || 1;
    const maxQty = product.maxOrderQty || 999;
    
    if (newQty < minQty) {
      toast.error(`Minimum order quantity is ${minQty}`);
    } else if (newQty > maxQty) {
      toast.error(`Maximum order quantity is ${maxQty}`);
    } else {
      updateItemQuantity(itemId, newQty);
    }
  };

  const handleRemoveItem = (itemId, productName) => {
    removeItem(itemId);
    toast.success(`${productName} removed from cart`);
  };

  const total = getCartTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link to="/shop" className="btn-primary inline-flex items-center">
            <ShoppingCart size={18} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-2xl font-display font-bold text-primary-700">
                Bonnesante Medicals
              </Link>
              <p className="text-sm text-gray-600">Shopping Cart</p>
            </div>
            <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Cart Items ({items.length})</h2>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                    toast.success('Cart cleared');
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>

            {items.map((item) => {
              const product = getProductById(item.productId);
              
              return (
                <div key={item.id} className="card p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                      {item.productId.includes('001') && '🩹'}
                      {item.productId.includes('002') && '🩺'}
                      {item.productId.includes('003') && '🧴'}
                      {item.productId.includes('004') && '📏'}
                      {item.productId.includes('005') && '🩹'}
                      {item.productId.includes('006') && '🩹'}
                      {item.productId.includes('007') && '🩹'}
                      {item.productId.includes('008') && '🩹'}
                      {item.productId.includes('009') && '🧰'}
                      {item.productId.includes('010') && '🧤'}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{item.sku}</p>
                      <p className="text-lg font-bold text-primary-600">
                        ₦{item.price.toLocaleString()} 
                        <span className="text-sm text-gray-500 font-normal"> /{item.unit}</span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center bg-gray-50 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {product && (
                          <span className="text-xs text-gray-500">
                            Max: {product.maxOrderQty || 999}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-xl font-bold text-gray-900">
                        ₦{item.subtotal.toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-600 hover:text-red-700 flex items-center justify-end"
                      >
                        <Trash2 size={18} className="mr-1" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">TBD at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary flex items-center justify-center mb-4"
              >
                Proceed to Checkout
                <ArrowRight size={18} className="ml-2" />
              </Link>

              {/* Customer Info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Delivering to:</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.state}</p>
                <p className="text-sm text-gray-600">{user?.phone}</p>
              </div>

              {/* Distributor Info */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Your Distributor:</p>
                <p className="font-semibold text-gray-900">{user?.assignedDistributor?.name}</p>
                <p className="text-sm text-gray-600">{user?.assignedDistributor?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailCart;
