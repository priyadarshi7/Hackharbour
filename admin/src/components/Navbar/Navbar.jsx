import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className='navbar'>
      <div className='navbar-left'>
        <img className='logo' src={assets.logo} alt="Jungle Safari" />
        <h1 className='navbar-title'>Jungle Safari</h1>
      </div>
      
      <div className='navbar-center'>
        <div className='search-container'>
          <input type="text" placeholder="Search adventures..." className='search-input' />
          <button className='search-button'>
            <img src={assets.search_icon || assets.logo} alt="Search" className='search-icon' />
          </button>
        </div>
      </div>
      
      <div className='navbar-right'>
        <div className='nav-icons'>
          <div className='nav-icon'>
            <img src={assets.notification_icon || assets.logo} alt="Notifications" />
            <span className='badge'>3</span>
          </div>
          <div className='nav-icon'>
            <img src={assets.message_icon || assets.logo} alt="Messages" />
          </div>
        </div>
        
        <div className='profile-container' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <img className='profile' src={assets.profile_image} alt="Profile" />
          <span className='profile-name'>Safari Admin</span>
          <img 
            className={`dropdown-arrow ${isMenuOpen ? 'rotated' : ''}`} 
            src={assets.arrow_icon || assets.logo} 
            alt="Dropdown" 
          />
          
          {isMenuOpen && (
            <div className='profile-dropdown'>
              <Link to="/profile" className='dropdown-item'>My Profile</Link>
              <Link to="/account" className='dropdown-item'>Account Settings</Link>
              <Link to="/bookings" className='dropdown-item'>My Bookings</Link>
              <div className='dropdown-divider'></div>
              <Link to="/logout" className='dropdown-item logout'>Logout</Link>
            </div>
          )}
        </div>
        
        <button className='mobile-menu-button' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
      
      {isMenuOpen && (
        <div className='mobile-menu'>
          <div className='mobile-search'>
            <input type="text" placeholder="Search adventures..." />
            <button>
              <img src={assets.search_icon || assets.logo} alt="Search" />
            </button>
          </div>
          <Link to="/profile" className='mobile-menu-item'>My Profile</Link>
          <Link to="/notifications" className='mobile-menu-item'>Notifications <span className='mobile-badge'>3</span></Link>
          <Link to="/messages" className='mobile-menu-item'>Messages</Link>
          <Link to="/account" className='mobile-menu-item'>Account Settings</Link>
          <Link to="/bookings" className='mobile-menu-item'>My Bookings</Link>
          <Link to="/logout" className='mobile-menu-item logout'>Logout</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;