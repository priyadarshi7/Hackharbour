import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { ShoppingBag, Package, ArrowRight } from 'lucide-react';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url, token, currency } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/order/userorders`, 
        {}, 
        { headers: { token } }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, url]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((order, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order #{order._id?.slice(-6) || index}</p>
                    <p className="font-medium">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} × {item.quantity}
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 text-lg font-semibold">
                    {currency}{order.amount}.00
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">
                      Items: {order.items.length}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    Track Order
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;