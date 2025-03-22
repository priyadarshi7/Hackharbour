import React from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage/Home'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrder/MyOrder'
import Verify from './pages/Verify/Verify'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { ToastContainer } from 'react-toastify'
import StoreNavbar from './components/StoreNavbar/StoreNavbar'
import './App.css'
import Header from './components/Header/Header'
import ProductDetail from './components/ProductDetail/ProductDetail'
import Footer from './components/Footer/Footer'
import VRStore from './VR/VR'
import UserProfile from './components/Profile/Profile'
import TicketSelector from './TicketChatbotComponents/TicketSelector'
import TicketChat from './pages/TicketChat/TicketChat'
import ComplaintBot from './components/CommplaintBot/ComplaintBot'

export default function App() {
  const location = useLocation();
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <>
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}

      {location.pathname == "/" && <StoreNavbar setShowLogin={setShowLogin} />}
      {location.pathname == "/cart" && <StoreNavbar setShowLogin={setShowLogin} />}
      {location.pathname == "/order" && <StoreNavbar setShowLogin={setShowLogin} />}
      {location.pathname == "/myorders" && <StoreNavbar setShowLogin={setShowLogin} />}
      {location.pathname == "/verify" && <StoreNavbar setShowLogin={setShowLogin} />}

      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/vr" element={<VRStore/>} />
            <Route path="/profile/:userId" element={<UserProfile/>} />
            <Route path="/ticket" element={<TicketChat/>} />
            <Route path="/complaint" element={<ComplaintBot/>} />
      </Routes>
      {/* <Footer/> */}
    </>
  )
}
