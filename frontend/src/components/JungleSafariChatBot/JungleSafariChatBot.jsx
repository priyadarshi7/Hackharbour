import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Base API URL - change this to your actual backend URL
const API_URL = 'http://127.0.0.1:8000';

const JungleSafariChatbot = () => {
  const [messages, setMessages] = useState([
    { id: 0, text: "Welcome to Jungle Safari! I'm your virtual assistant to help you book tickets for an unforgettable wildlife experience.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [bookingState, setBookingState] = useState('initial');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const messagesEndRef = useRef(null);

  // Create a unique session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    
    // Initiate chat
    sendMessage('Hi', true);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const sendMessage = async (text, isInitial = false) => {
    // Don't add initial messages to the chat history UI
    if (!isInitial) {
      setMessages(prev => [...prev, { id: prev.length, text, sender: 'user' }]);
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: text,
        session_id: sessionId
      });
      
      // Add bot response to messages
      setMessages(prev => [...prev, { 
        id: prev.length, 
        text: response.data.response, 
        sender: 'bot' 
      }]);
      
      // Check if we have payment info and invoice
      if (response.data.payment_info) {
        setPaymentInfo(response.data.payment_info);
        setInvoice(response.data.invoice);
        setBookingState('payment_pending');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        id: prev.length, 
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentInfo) return;
    
    setLoading(true);
    try {
      // Create payment intent
      const intentResponse = await axios.post(`${API_URL}/create-payment-intent`, {
        booking_id: paymentInfo.booking_id,
        amount: paymentInfo.amount,
        currency: 'inr',
        email: paymentInfo.email,
        name: paymentInfo.name,
        description: paymentInfo.description,
        return_url: `${window.location.origin}/payment-success`
      });
      
      // Simulate successful payment for demo
      // In a real application, you would integrate with Stripe
      const clientSecret = intentResponse.data.client_secret;
      
      // For demo purposes, directly check payment status
      const paymentResult = await axios.post(
        `${API_URL}/check-payment/${paymentInfo.booking_id}/${intentResponse.data.payment_intent_id}`
      );
      
      if (paymentResult.data.status === 'success' || paymentResult.data.status === 'pending') {
        setBookingState('payment_successful');
        
        // Fetch the latest invoice
        try {
          const invoiceResponse = await axios.get(`${API_URL}/invoice/${paymentInfo.booking_id}`);
          setInvoice(invoiceResponse.data);
        } catch (err) {
          console.error('Error fetching invoice:', err);
        }
        
        setMessages(prev => [...prev, { 
          id: prev.length, 
          text: "Great news! Your payment has been processed successfully. Your tickets for the Jungle Safari have been confirmed. You'll receive a confirmation email shortly with all the details. Thank you for booking with us!",
          sender: 'bot' 
        }]);
      } else {
        setBookingState('payment_failed');
        setMessages(prev => [...prev, { 
          id: prev.length, 
          text: "I'm sorry, but there was an issue processing your payment. Please try again or use a different payment method.",
          sender: 'bot' 
        }]);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setBookingState('payment_failed');
      setMessages(prev => [...prev, { 
        id: prev.length, 
        text: "I'm sorry, but there was an issue processing your payment. Please try again later or contact our support team.",
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: prev.length, text: input, sender: 'user' }]);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/complaint`, {
        message: input,
        session_id: sessionId
      });
      
      setMessages(prev => [...prev, { 
        id: prev.length, 
        text: response.data.response, 
        sender: 'bot' 
      }]);
      
      setInput('');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessages(prev => [...prev, { 
        id: prev.length, 
        text: "Sorry, I couldn't process your complaint right now. Please try again later or contact us directly.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jungle Safari Experience</h1>
          <nav>
            <ul className="flex space-x-6">
              <li className="hover:text-green-200">Home</li>
              <li className="hover:text-green-200">Safari Tours</li>
              <li className="hover:text-green-200">About Us</li>
              <li className="hover:text-green-200">Contact</li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 container mx-auto p-4 gap-4 overflow-hidden">
        {/* Left sidebar - decorative for safari theme */}
        <div className="hidden md:block w-1/4 bg-green-700 rounded-lg p-4 text-white">
          <h2 className="text-xl font-bold mb-4">Explore Wildlife</h2>
          <ul className="space-y-2">
            <li className="p-2 hover:bg-green-600 rounded">Tiger Safari</li>
            <li className="p-2 hover:bg-green-600 rounded">Elephant Rides</li>
            <li className="p-2 hover:bg-green-600 rounded">Bird Watching</li>
            <li className="p-2 hover:bg-green-600 rounded">Nature Trails</li>
            <li className="p-2 hover:bg-green-600 rounded">Night Safari</li>
          </ul>
          <div className="mt-8">
            <h3 className="font-bold mb-2">Safari Hours</h3>
            <p>Morning: 6:00 AM - 10:00 AM</p>
            <p>Evening: 3:00 PM - 6:30 PM</p>
            <p className="mt-4 italic">Closed on Mondays for maintenance</p>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-700 text-white p-3">
            <h2 className="font-bold">Safari Booking Assistant</h2>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender === 'bot' ? 'text-left' : 'text-right'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    message.sender === 'bot' 
                    ? 'bg-green-100 rounded-bl-none' 
                    : 'bg-blue-100 rounded-br-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-green-100 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Payment Section - Only show when needed */}
          {bookingState === 'payment_pending' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h3 className="font-bold text-lg mb-2">Complete Your Booking</h3>
              <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                <p className="font-semibold">Booking Details:</p>
                <p>Booking ID: {paymentInfo?.booking_id}</p>
                <p>Number of Tickets: {invoice?.booking_details?.number_of_tickets}</p>
                <p>Price per Ticket: ₹{invoice?.booking_details?.price_per_ticket}</p>
                <p>Subtotal: ₹{invoice?.booking_details?.subtotal}</p>
                <p>GST (18%): ₹{invoice?.booking_details?.gst}</p>
                <p className="font-bold">Total: ₹{invoice?.booking_details?.grand_total}</p>
              </div>
              <button 
                onClick={handlePayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          )}
          
          {/* Invoice Section - Show after successful payment */}
          {bookingState === 'payment_successful' && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                <h3 className="font-bold text-lg text-center mb-4">Payment Successful</h3>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Invoice Number:</span>
                  <span>{invoice?.invoice_id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Booking ID:</span>
                  <span>{invoice?.booking_id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Customer:</span>
                  <span>{invoice?.customer_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Email:</span>
                  <span>{invoice?.email}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Contact:</span>
                  <span>{invoice?.contact_number}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between mb-1">
                    <span>Tickets:</span>
                    <span>{invoice?.booking_details?.number_of_tickets} × ₹{invoice?.booking_details?.price_per_ticket}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Subtotal:</span>
                    <span>₹{invoice?.booking_details?.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>GST (18%):</span>
                    <span>₹{invoice?.booking_details?.gst}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{invoice?.booking_details?.grand_total}</span>
                  </div>
                </div>
                <div className="mt-4 text-center text-green-600 font-semibold">
                  <p>Thank you for your booking!</p>
                  <p className="text-sm text-gray-600 mt-1">A confirmation has been sent to your email.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  // Reset the chat for a new booking
                  setBookingState('initial');
                  setPaymentInfo(null);
                  setInvoice(null);
                  setMessages([{ 
                    id: 0, 
                    text: "Thank you for your booking! Is there anything else I can help you with today?", 
                    sender: 'bot' 
                  }]);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Start New Conversation
              </button>
            </div>
          )}
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-green-500"
                disabled={loading || bookingState === 'payment_successful'}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
                disabled={loading || !input.trim() || bookingState === 'payment_successful'}
              >
                Send
              </button>
            </div>
            
            {/* Additional actions */}
            <div className="flex mt-2 text-sm">
              <button
                type="button"
                onClick={submitComplaint}
                className="text-red-600 hover:text-red-800"
                disabled={loading || !input.trim()}
              >
                Submit as complaint
              </button>
              <span className="flex-1"></span>
              <button 
                type="button"
                onClick={() => {
                  // Reset the chat
                  setBookingState('initial');
                  setPaymentInfo(null);
                  setInvoice(null);
                  setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
                  setMessages([{ 
                    id: 0, 
                    text: "Welcome to Jungle Safari! I'm your virtual assistant to help you book tickets for an unforgettable wildlife experience.", 
                    sender: 'bot' 
                  }]);
                  // Initiate new chat
                  sendMessage('Hi', true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Start over
              </button>
            </div>
          </form>
        </div>
        
        {/* Right sidebar - safari highlights */}
        <div className="hidden lg:block w-1/4 bg-yellow-50 rounded-lg p-4">
          <h2 className="text-xl font-bold text-green-800 mb-4">Safari Highlights</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h3 className="font-bold text-green-700">Bengal Tigers</h3>
              <p className="text-sm text-gray-700">Spot the majestic Bengal tigers in their natural habitat. Our park is home to over 60 tigers.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h3 className="font-bold text-green-700">Asian Elephants</h3>
              <p className="text-sm text-gray-700">Witness the gentle giants of the forest as they roam freely in protected areas.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h3 className="font-bold text-green-700">Exotic Birds</h3>
              <p className="text-sm text-gray-700">Over 200 species of birds call our sanctuary home, making it a paradise for bird watchers.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <h3 className="font-bold text-green-700">Safe Experience</h3>
              <p className="text-sm text-gray-700">All our safaris are conducted with trained guides and follow strict safety protocols.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-lg mb-2">Jungle Safari Experience</h3>
              <p>Experience the wild like never before</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Contact Us</h4>
              <p>Email: info@junglesafari.com</p>
              <p>Phone: +91 1234567890</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-700 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Jungle Safari Experience. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JungleSafariChatbot;