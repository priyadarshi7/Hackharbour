import React, { useEffect, useState } from 'react';
import './List.css';
import { url, currency } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Search, Filter, AlertTriangle, Package, DollarSign, Trash2, RefreshCw } from 'lucide-react';

const STOCK_THRESHOLD = 10; // Threshold for low stock warning
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#6BCB77'];

const List = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryStats, setCategoryStats] = useState([]);
  const [stockStats, setStockStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    healthy: 0
  });
  const [totalValue, setTotalValue] = useState(0);
  const [stockHistory, setStockHistory] = useState([]);

  // Get unique categories
  const categories = ['All', ...new Set(list.map(item => item.category))];

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        const data = response.data.data;
        setList(data);
        setFilteredList(data);
        analyzeData(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (data) => {
    // Calculate category statistics
    const catStats = categories
      .filter(cat => cat !== 'All')
      .map(category => {
        const items = data.filter(item => item.category === category);
        return {
          name: category,
          count: items.length,
          value: items.reduce((sum, item) => sum + (item.price * item.stock), 0),
          averagePrice: items.length ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0
        };
      });
    setCategoryStats(catStats);

    // Calculate stock statistics
    const lowStock = data.filter(item => item.stock > 0 && item.stock <= STOCK_THRESHOLD).length;
    const outOfStock = data.filter(item => item.stock === 0).length;
    const healthy = data.filter(item => item.stock > STOCK_THRESHOLD).length;
    setStockStats({
      total: data.length,
      lowStock,
      outOfStock,
      healthy
    });

    // Calculate total inventory value
    const value = data.reduce((sum, item) => sum + (item.price * item.stock), 0);
    setTotalValue(value);

    // Generate mock stock history data (in a real app, this would come from the backend)
    const history = generateMockStockHistory(data);
    setStockHistory(history);
  };

  // Generate mock history data for chart
  const generateMockStockHistory = (data) => {
    const categories = [...new Set(data.map(item => item.category))].filter(cat => cat !== 'All');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map(month => {
      const result = { name: month };
      categories.forEach(category => {
        // Create some realistic-looking mock data that changes slightly each month
        const baseValue = data.filter(item => item.category === category).length;
        const randomVariation = Math.floor(Math.random() * 5) - 2; // Random value between -2 and 2
        result[category] = Math.max(0, baseValue + randomVariation);
      });
      return result;
    });
  };

  const removeProduct = async (productId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, {
        id: productId
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Error removing product");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchList();
    // Set up auto-refresh every 5 minutes (in a real app)
    const interval = setInterval(() => {
      fetchList();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter and sort products when search term, category, or sort options change
    let results = [...list];
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      results = results.filter(item => item.category === selectedCategory);
    }
    
    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'stock') {
        comparison = a.stock - b.stock;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredList(results);
  }, [list, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getPriorityColor = (stock) => {
    if (stock === 0) return 'bg-red-500';
    if (stock <= STOCK_THRESHOLD) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="dashboard-container">
      {/* Header with stats */}
      <div className="dashboard-header">
        <h1>Product Inventory Dashboard</h1>
        <div className="header-action-buttons">
          <button className="refresh-btn" onClick={fetchList}>
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <Package size={24} />
          </div>
          <div className="stat-card-content">
            <h3>Total Products</h3>
            <p>{stockStats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-icon red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-card-content">
            <h3>Out of Stock</h3>
            <p>{stockStats.outOfStock}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-icon yellow">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-card-content">
            <h3>Low Stock</h3>
            <p>{stockStats.lowStock}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-card-content">
            <h3>Inventory Value</h3>
            <p>{currency}{totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <h2>Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h2>Stock Levels by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, 'Items']} />
              <Legend />
              <Bar dataKey="count" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="chart-container full-width">
        <h2>Inventory History by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={stockHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {categories
              .filter(cat => cat !== 'All')
              .map((category, index) => (
                <Line 
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Filter and search controls */}
      <div className="product-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-box">
            <Filter size={20} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-box">
            <span>Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="category">Category</option>
            </select>
            <button 
              className="sort-direction"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Alerts section for low stock items */}
      {(stockStats.lowStock > 0 || stockStats.outOfStock > 0) && (
        <div className="alert-section">
          <h2>
            <AlertTriangle size={20} />
            Inventory Alerts
          </h2>
          <div className="alert-items">
            {filteredList
              .filter(item => item.stock <= STOCK_THRESHOLD)
              .map((item, index) => (
                <div key={index} className="alert-item">
                  <div className={`alert-priority ${getPriorityColor(item.stock)}`}></div>
                  <div className="alert-content">
                    <h3>{item.name}</h3>
                    <p>{item.stock === 0 ? 'OUT OF STOCK' : `Low stock: ${item.stock} units`}</p>
                  </div>
                  <div className="alert-action">
                    <button className="reorder-btn">Reorder</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Products table */}
      <div className="products-table-container">
        <h2>Products Inventory ({filteredList.length})</h2>
        
        {loading ? (
          <div className="loading-indicator">Loading products...</div>
        ) : filteredList.length === 0 ? (
          <div className="no-results">No products found matching your criteria</div>
        ) : (
          <div className="products-table">
            <div className="table-header">
              <div className="table-cell image-cell">Image</div>
              <div className="table-cell name-cell" onClick={() => handleSort('name')}>
                Name {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="table-cell category-cell" onClick={() => handleSort('category')}>
                Category {sortBy === 'category' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="table-cell price-cell" onClick={() => handleSort('price')}>
                Price {sortBy === 'price' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="table-cell stock-cell" onClick={() => handleSort('stock')}>
                Stock {sortBy === 'stock' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="table-cell value-cell">
                Value
              </div>
              <div className="table-cell action-cell">Actions</div>
            </div>
            
            {filteredList.map((item, index) => (
              <div key={index} className={`table-row ${item.stock <= STOCK_THRESHOLD ? 'low-stock-row' : ''}`}>
                <div className="table-cell image-cell">
                  <img src={`${url}/images/${item.image}`} alt={item.name} />
                </div>
                <div className="table-cell name-cell">{item.name}</div>
                <div className="table-cell category-cell">
                  <span className="category-tag">{item.category}</span>
                </div>
                <div className="table-cell price-cell">{currency}{item.price.toFixed(2)}</div>
                <div className="table-cell stock-cell">
                  <span className={`stock-badge ${item.stock === 0 ? 'out-of-stock' : item.stock <= STOCK_THRESHOLD ? 'low-stock' : ''}`}>
                    {item.stock}
                  </span>
                </div>
                <div className="table-cell value-cell">
                  {currency}{(item.price * item.stock).toFixed(2)}
                </div>
                <div className="table-cell action-cell">
                  <button 
                    className="delete-btn"
                    onClick={() => removeProduct(item._id)}
                    title="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default List;