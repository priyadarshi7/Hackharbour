import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { ShoppingCart, User, Menu, X, Package } from 'lucide-react';
import axios from 'axios';

const StoreNavbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalCartAmount, token, setToken, cartItems } = useContext(StoreContext);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  const totalAmount = getTotalCartAmount();
  
  // Function to decode JWT token and extract user data
  const decodeToken = () => {
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken) {
      return null;
    }
    
    try {
      // JWT tokens are in the format: header.payload.signature
      // Split by dot and get the payload (second part)
      const payload = storedToken.split('.')[1];
      
      // The payload is base64 encoded, so decode it
      // We need to handle base64url format (replacing - with + and _ with /)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      
      // Parse the JSON string to get the user object
      const userData = JSON.parse(decodedPayload);
      
      return userData;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Get user data from token when component mounts or token changes
  useEffect(() => {
    if (token) {
      const decodedData = decodeToken();
      if (decodedData) {
        setUserId(decodedData.id || decodedData.userId || decodedData.sub);
        setUserData(decodedData);
      }
    }
  }, [token]);
  
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUserId(null);
    setUserData(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {/* <img className="h-8 w-auto" src="/logo.png" alt="Store Logo" /> */}
              <span className="ml-2 text-xl font-bold text-gray-800">Jungle Safari: Store</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <Link 
                to="/" 
                onClick={() => setMenu("home")} 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${menu === "home" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Home
              </Link>
              <Link 
                to="/home" 
                onClick={() => setMenu("menu")} 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${menu === "menu" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Jungle Home
              </Link>
              <Link 
                to="/vr" 
                onClick={() => setMenu("contact")} 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${menu === "contact" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                VR
              </Link>
            </div>
            
            {/* Cart and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none">
                <ShoppingCart className="h-6 w-6" />
                {totalAmount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white">
                    {Math.ceil(totalAmount / 100)}
                  </span>
                )}
              </Link>
              
              {/* User Menu */}
              {!token ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </button>
              ) : (
                <div className="relative ml-3">
                  <div className="group inline-block">
                    <button className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 focus:outline-none">
                      <User className="h-5 w-5" />
                      {userData && userData.name && (
                        <span className="ml-2 text-sm">{userData.name.split(' ')[0]}</span>
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                      <Link 
                        to="/myorders" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          My Orders
                        </div>
                      </Link>
                      <Link 
                        to={userId ? `/profile/${userId}` : '/profile'} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </div>
                      </Link>
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Link to="/cart" className="relative p-1 mr-4 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none">
              <ShoppingCart className="h-6 w-6" />
              {totalAmount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white">
                  {Math.ceil(totalAmount / 100)}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => {
                setMenu("home");
                setIsMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                menu === "home" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Home
            </Link>
            <Link
              to="/home"
              onClick={() => {
                setMenu("menu");
                setIsMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                menu === "menu" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Jungle Home
            </Link>
            <Link
              to="/vr"
              onClick={() => {
                setMenu("contact");
                setIsMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                menu === "contact" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              VR
            </Link>
            
            {!token ? (
              <button
                onClick={() => {
                  setShowLogin(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white"
              >
                Sign In
              </button>
            ) : (
              <>
                <Link
                  to="/myorders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to={userId ? `/profile/${userId}` : '/profile'}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default StoreNavbar;