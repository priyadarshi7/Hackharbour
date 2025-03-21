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
import JungleSafariChatbot from './components/JungleSafariChatBot/JungleSafariChatBot'
import JungleSafariChat from './pages/JungleSafariChat/JungleSafariChat'
import ChatInterface from './components/ChatInterface'
import PaymentPage from './components/PaymentModal'
import PaymentSuccess from './components/PaymentSuccess'
import InvoicePage from './components/InvoiceView'
import ComplaintForm from './components/ComplaintForm'
import './App.css'
import Header from './components/Header'
import ProductDetail from './components/ProductDetail/ProductDetail'
import Footer from './components/Footer/Footer'
import VRStore from './VR/VR'
import UserProfile from './components/Profile/Profile'

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
        {/* <Route path="/chat/tickets" element={<JungleSafariChat/>} /> */}
        <Route path="/chat/tickets" element={<ChatInterface/>} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
            <Route path="/invoice/:bookingId" element={<InvoicePage />} />
            <Route path="/complaint" element={<ComplaintForm />} />
            <Route path="/vr" element={<VRStore/>} />
            <Route path="/profile/:userId" element={<UserProfile/>} />
      </Routes>
      {/* <Footer/> */}
    </>
  )
}
