import React, { useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { 
    cartItems, 
    food_list, 
    removeFromCart, 
    getTotalCartAmount, 
    url, 
    currency, 
    deliveryCharge 
  } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const hasItems = getTotalCartAmount() > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8" />
            Your Cart
          </h1>
        </div>

        {/* Cart Items Section */}
        <div className="p-6">
          {hasItems ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remove</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {food_list.map((item, index) => {
                    if (cartItems[item._id] > 0) {
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img src={url + "/images/" + item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                              </div>
                              <div className="ml-4">
                                <p className="text-lg font-medium text-gray-900">{item.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {currency}{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                              {cartItems[item._id]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {currency}{(item.price * cartItems[item._id]).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button 
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <XCircle className="h-6 w-6" />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <ShoppingBag className="h-full w-full" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Add some delicious items to your cart to get started.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/menu')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Browse Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {hasItems && (
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 border-t border-gray-200">
            {/* Promo Code Section */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Promo Code</h2>
                <p className="text-sm text-gray-600 mb-4">If you have a promo code, enter it here</p>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter code"
                  />
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Totals Section */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Totals</h2>
                <div className="space-y-4">
                  <div className="flex justify-between pb-2">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="text-gray-900 font-medium">{currency}{getTotalCartAmount().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4 pb-2">
                    <p className="text-gray-600">Delivery Fee</p>
                    <p className="text-gray-900 font-medium">{currency}{deliveryCharge.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <p className="text-lg font-bold text-gray-900">Total</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {currency}{(getTotalCartAmount() + deliveryCharge).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/order')}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;