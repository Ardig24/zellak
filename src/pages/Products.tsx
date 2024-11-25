import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { OrderItem } from '../types';
import { ChevronLeft, LogOut, ShoppingCart, Send, Trash2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { products, categories, currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const handleQuantityChange = (
    productId: string,
    productName: string,
    variantId: string,
    size: string,
    price: number,
    quantity: number
  ) => {
    if (quantity < 0) return;

    setOrderItems((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === productId && item.variantId === variantId
      );

      if (existingItem) {
        if (quantity === 0) {
          return prev.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId)
          );
        }
        return prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        );
      }

      if (quantity === 0) return prev;

      return [
        ...prev,
        { productId, productName, variantId, size, quantity, price },
      ];
    });
  };

  const removeItem = (productId: string, variantId: string) => {
    setOrderItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSendOrder = async () => {
    if (!currentUser || orderItems.length === 0) return;

    const orderSummary = orderItems
      .map(
        (item) =>
          `${item.productName} (${item.size}) - ${t('products.quantity')}: ${
            item.quantity
          } - ${t('products.price')}: €${(item.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const emailParams = {
      to_email: 'your-email@example.com',
      from_name: currentUser.companyName,
      message: `
${t('admin.companyDetails')}:
${t('admin.companyName')}: ${currentUser.companyName}
${t('admin.address')}: ${currentUser.address}
${t('admin.contactNumber')}: ${currentUser.contactNumber}
${t('admin.email')}: ${currentUser.email}

${t('products.orderSummary')}:
${orderSummary}

${t('products.total')}: €${calculateTotal().toFixed(2)}
`,
    };

    try {
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        emailParams,
        'YOUR_PUBLIC_KEY'
      );
      alert(t('products.orderSuccess'));
      setOrderItems([]);
    } catch (error) {
      alert(t('products.orderError'));
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : [];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {selectedCategory ? (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t('products.backToCategories')}
              </button>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">
                {t('products.categories')}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Products Section */}
        <div className="flex-1">
          {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-800">
                    {category.name}
                  </h2>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center"
                >
                  <img
                    src={product.icon}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <div className="mt-2 space-y-2">
                      {product.variants.map((variant) => {
                        const orderItem = orderItems.find(
                          (item) =>
                            item.productId === product.id &&
                            item.variantId === variant.id
                        );
                        return (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-600">{variant.size}</span>
                            <div className="flex items-center space-x-4">
                              <input
                                type="number"
                                min="0"
                                value={orderItem?.quantity || 0}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    product.id,
                                    product.name,
                                    variant.id,
                                    variant.size,
                                    variant.prices[currentUser.category],
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 border rounded"
                                placeholder={t('products.quantity')}
                              />
                              <span className="font-medium">
                                €{variant.prices[currentUser.category].toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary Section */}
        <div className="w-96">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {t('products.orderSummary')}
              </h2>
              <div className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" />
                <span className="text-orange-600 font-medium">
                  {orderItems.length} {t('products.items')}
                </span>
              </div>
            </div>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                {t('products.emptyOrder')}
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {orderItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between items-start pb-4 border-b"
                    >
                      <div>
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-600">{item.size}</p>
                        <p className="text-sm">
                          {item.quantity} × €{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-4">
                          €{(item.quantity * item.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold">
                      {t('products.total')}:
                    </span>
                    <span className="text-lg font-bold">
                      €{calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleSendOrder}
                    disabled={orderItems.length === 0}
                    className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {t('products.sendOrder')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}