import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CreditCard, DollarSign, MapPin, ShoppingBag, Truck } from 'lucide-react';

const PlaceOrder = () => {
  const [payment, setPayment] = useState("cod");
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const { 
    getTotalCartAmount, 
    token, 
    food_list, 
    cartItems, 
    url, 
    setCartItems, 
    currency, 
    deliveryCharge 
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    let orderItems = [];
    food_list.map(((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
      return null;
    }));
    
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + deliveryCharge,
    };
    
    try {
      if (payment === "stripe") {
        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
        if (response.data.success) {
          const { session_url } = response.data;
          window.location.replace(session_url);
        } else {
          toast.error("Something Went Wrong");
        }
      } else {
        let response = await axios.post(url + "/api/order/placecod", orderData, { headers: { token } });
        if (response.data.success) {
          navigate("/myorders");
          toast.success(response.data.message);
          setCartItems({});
        } else {
          toast.error("Something Went Wrong");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("To place an order sign in first");
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Checkout</h1>
          <p className="mt-4 text-lg text-gray-600">Complete your order details below</p>
        </div> */}
        
        <form onSubmit={placeOrder} className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Delivery Information */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      id="firstName"
                      name="firstName" 
                      onChange={onChangeHandler} 
                      value={data.firstName} 
                      placeholder="First name" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName"
                      name="lastName" 
                      onChange={onChangeHandler} 
                      value={data.lastName} 
                      placeholder="Last name" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email" 
                    onChange={onChangeHandler} 
                    value={data.email} 
                    placeholder="Email address" 
                    required 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                  <input 
                    type="text" 
                    id="street"
                    name="street" 
                    onChange={onChangeHandler} 
                    value={data.street} 
                    placeholder="Street" 
                    required 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input 
                      type="text" 
                      id="city"
                      name="city" 
                      onChange={onChangeHandler} 
                      value={data.city} 
                      placeholder="City" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input 
                      type="text" 
                      id="state"
                      name="state" 
                      onChange={onChangeHandler} 
                      value={data.state} 
                      placeholder="State" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input 
                      type="text" 
                      id="zipcode"
                      name="zipcode" 
                      onChange={onChangeHandler} 
                      value={data.zipcode} 
                      placeholder="Zip code" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input 
                      type="text" 
                      id="country"
                      name="country" 
                      onChange={onChangeHandler} 
                      value={data.country} 
                      placeholder="Country" 
                      required 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    id="phone"
                    name="phone" 
                    onChange={onChangeHandler} 
                    value={data.phone} 
                    placeholder="Phone" 
                    required 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Order Summary and Payment */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <ShoppingBag className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{currency}{getTotalCartAmount().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-600">Delivery Fee</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {currency}{getTotalCartAmount() === 0 ? "0.00" : deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {currency}{(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                    />
                    <div className="ml-3 flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      checked={payment === "stripe"}
                      onChange={() => setPayment("stripe")}
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900">Credit / Debit Card (Stripe)</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {payment === "cod" ? "Place Order" : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;