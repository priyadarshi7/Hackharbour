import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={assets.logo} alt="Jungle Safari" className="logo" />
        <h2 className="sidebar-title">Jungle Safari</h2>
      </div>
      
      <div className="sidebar-options">
        <NavLink 
          to='/add' 
          className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}
        >
          <div className="sidebar-icon">
            <img src={assets.add_icon} alt="" />
          </div>
          <p>List Products: Manual</p>
        </NavLink>
        
        <NavLink 
          to='/add-automate' 
          className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}
        >
          <div className="sidebar-icon">
            <img src={assets.add_icon} alt="" />
          </div>
          <p>List Products: Automation</p>
        </NavLink>
        
        <NavLink 
          to='/list' 
          className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}
        >
          <div className="sidebar-icon">
            <img src={assets.order_icon} alt="" />
          </div>
          <p>List Items</p>
        </NavLink>
        
        <NavLink 
          to='/orders' 
          className={({ isActive }) => isActive ? "sidebar-option active" : "sidebar-option"}
        >
          <div className="sidebar-icon">
            <img src={assets.order_icon} alt="" />
          </div>
          <p>Orders</p>
        </NavLink>
      </div>
      
      <div className="sidebar-footer">
        <NavLink 
          to='/settings' 
          className="sidebar-option"
        >
          <div className="sidebar-icon">
            <img src={assets.settings_icon || assets.order_icon} alt="" />
          </div>
          <p>Settings</p>
        </NavLink>
        
        <NavLink 
          to='/help' 
          className="sidebar-option"
        >
          <div className="sidebar-icon">
            <img src={assets.help_icon || assets.order_icon} alt="" />
          </div>
          <p>Help</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;