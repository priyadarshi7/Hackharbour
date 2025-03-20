import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';
import { Clock, Package, Truck, Check, Search, Sliders, Filter, MoreVertical, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import './Orders.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statsData, setStatsData] = useState({
    total: 0,
    processing: 0,
    delivering: 0,
    delivered: 0,
    revenue: 0
  });

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        const orderData = response.data.data.reverse();
        setOrders(orderData);
        setFilteredOrders(orderData);
        calculateStats(orderData);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Error connecting to server");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData) => {
    const stats = {
      total: orderData.length,
      processing: orderData.filter(order => order.status === "Food Processing").length,
      delivering: orderData.filter(order => order.status === "Out for delivery").length,
      delivered: orderData.filter(order => order.status === "Delivered").length,
      revenue: orderData.reduce((sum, order) => sum + order.amount, 0)
    };
    setStatsData(stats);
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        await fetchAllOrders();
      } else {
        toast.error("Status update failed");
      }
    } catch (error) {
      toast.error("Error connecting to server");
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterOrders(term, filterStatus, sortBy);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterOrders(searchTerm, status, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    filterOrders(searchTerm, filterStatus, sort);
  };

  const filterOrders = (term, status, sort) => {
    let result = [...orders];
    
    // Apply search filter
    if (term) {
      result = result.filter(order => 
        order.address.firstName.toLowerCase().includes(term.toLowerCase()) ||
        order.address.lastName.toLowerCase().includes(term.toLowerCase()) ||
        order.address.phone.includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (status !== 'All') {
      result = result.filter(order => order.status === status);
    }
    
    // Apply sort
    if (sort === 'newest') {
      // Assuming orders are already sorted by newest first from the API
    } else if (sort === 'oldest') {
      result = [...result].reverse();
    } else if (sort === 'highestAmount') {
      result = [...result].sort((a, b) => b.amount - a.amount);
    } else if (sort === 'lowestAmount') {
      result = [...result].sort((a, b) => a.amount - b.amount);
    }
    
    setFilteredOrders(result);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Food Processing':
        return <Clock className="status-icon processing" />;
      case 'Out for delivery':
        return <Truck className="status-icon delivering" />;
      case 'Delivered':
        return <Check className="status-icon delivered" />;
      default:
        return <Package className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Food Processing':
        return 'status-processing';
      case 'Out for delivery':
        return 'status-delivering';
      case 'Delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Order Management</h1>
        <button className="refresh-btn" onClick={fetchAllOrders}>
          Refresh Orders
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{statsData.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon processing">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Processing</span>
            <span className="stat-value">{statsData.processing}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delivering">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Delivering</span>
            <span className="stat-value">{statsData.delivering}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delivered">
            <Check size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Delivered</span>
            <span className="stat-value">{statsData.delivered}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <span className="currency-symbol">{currency}</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{currency}{statsData.revenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search by name, phone or item..." 
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={18} />
            <span>Status:</span>
            <div className="filter-options">
              <button 
                className={filterStatus === 'All' ? 'active' : ''} 
                onClick={() => handleFilterChange('All')}
              >
                All
              </button>
              <button 
                className={filterStatus === 'Food Processing' ? 'active' : ''} 
                onClick={() => handleFilterChange('Food Processing')}
              >
                Processing
              </button>
              <button 
                className={filterStatus === 'Out for delivery' ? 'active' : ''} 
                onClick={() => handleFilterChange('Out for delivery')}
              >
                Delivering
              </button>
              <button 
                className={filterStatus === 'Delivered' ? 'active' : ''} 
                onClick={() => handleFilterChange('Delivered')}
              >
                Delivered
              </button>
            </div>
          </div>

          <div className="filter-group">
            <Sliders size={18} />
            <span>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highestAmount">Highest Amount</option>
              <option value="lowestAmount">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="orders-count">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <Package size={48} />
          <p>No orders found</p>
          {searchTerm || filterStatus !== 'All' ? (
            <p>Try adjusting your filters or search term</p>
          ) : (
            <p>No orders have been placed yet</p>
          )}
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order, index) => (
            <div 
              key={index} 
              className={`order-card ${getStatusClass(order.status)}`}
            >
              <div className="order-card-header" onClick={() => toggleOrderDetails(order._id)}>
                <div className="order-icon">
                  {getStatusIcon(order.status)}
                </div>
                <div className="order-basic-info">
                  <h3 className="customer-name">{order.address.firstName} {order.address.lastName}</h3>
                  <p className="order-summary">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {currency}{order.amount.toFixed(2)}
                  </p>
                </div>
                <div className="order-status-section">
                  <select 
                    className={`status-select ${getStatusClass(order.status)}`}
                    onChange={(e) => statusHandler(e, order._id)} 
                    value={order.status}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <button className="expand-btn">
                  {expandedOrderId === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {expandedOrderId === order._id && (
                <div className="order-details">
                  <div className="order-details-section">
                    <h4>Items Ordered</h4>
                    <ul className="order-items-list">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="order-item-detail">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-details-section">
                    <h4>Delivery Address</h4>
                    <div className="address-info">
                      <p className="address-line">
                        <MapPin size={16} />
                        {order.address.street}
                      </p>
                      <p className="address-line">
                        {order.address.city}, {order.address.state}, {order.address.zipcode}
                      </p>
                      <p className="address-line">
                        {order.address.country}
                      </p>
                      <p className="address-line phone">
                        <Phone size={16} />
                        {order.address.phone}
                      </p>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button className="action-btn print">Print Invoice</button>
                    <button className="action-btn contact">Contact Customer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;