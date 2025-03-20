import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  DollarSign, 
  MessageSquare, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import './Inventory.css';

const Inventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => sidebarOpen && setSidebarOpen(false);

  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/inventorymain', name: 'Inventory', icon: <Package size={20} /> },
    { path: '/orders', name: 'Orders', icon: <ShoppingCart size={20} /> },
    { path: '/product-analytics', name: 'Product Analytics', icon: <BarChart2 size={20} /> },
    { path: '/financial-reports', name: 'Financial Reports', icon: <DollarSign size={20} /> },
    { path: '/review-analysis', name: 'Review Analysis', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Jungle Safari</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        <div className="sidebar-content">
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={location.pathname === item.path ? 'active' : ''}
                    onClick={closeSidebar}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="logout-button">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header>
          <button className="menu-button" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </div>
          <div className="user-profile">
            <div className="user-avatar">JS</div>
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Inventory Manager</span>
            </div>
          </div>
        </header>

        <main onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Inventory;
