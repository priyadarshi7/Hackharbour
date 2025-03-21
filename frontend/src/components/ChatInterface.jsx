import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, CreditCard, CheckCircle, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';

// API base URL - change this to match your backend URL
const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div>
              <BookingSummary />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-3 mb-4 md:mb-0">
        <div className="bg-green-600 p-2 rounded-full">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-green-800">Jungle Safari Booking</h1>
      </div>
      <div className="text-sm text-gray-500">
        Book your wildlife adventure effortlessly
      </div>
    </header>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! Welcome to the Jungle Safari Booking assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize session
  useEffect(() => {
    const newSessionId = 'session_' + Date.now();
    setSessionId(newSessionId);
    
    // Auto-start the booking flow
    handleInitialBooking();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInitialBooking = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: 'start booking',
        session_id: sessionId
      });
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      console.error('Error starting booking flow:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage,
        session_id: sessionId
      });
      
      const newMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, newMessage]);
      
      // If payment info is received
      if (response.data.payment_info) {
        setBookingData(response.data);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col overflow-hidden">
      <div className="bg-green-700 text-white p-4 flex items-center space-x-2">
        <MessageCircle size={20} />
        <h2 className="text-lg font-semibold">Chat with Booking Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
          disabled={isLoading || input.trim() === ''}
        >
          <Send size={20} />
        </button>
      </form>
      
      {showPayment && bookingData && (
        <PaymentModal 
          bookingData={bookingData} 
          sessionId={sessionId}
          onClose={() => setShowPayment(false)}
          onSuccess={(result) => {
            setShowPayment(false);
            setMessages(prev => [
              ...prev, 
              { 
                role: 'assistant', 
                content: `Payment successful! Your booking is confirmed. Booking ID: ${bookingData.payment_info.booking_id}` 
              }
            ]);
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({ bookingData, sessionId, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Simulate a payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, always consider it a success
      setPaymentStatus('success');
      
      // Notify backend of successful payment
      await axios.post(`${API_BASE_URL}/confirm-payment`, {
        booking_id: bookingData.payment_info.booking_id,
        session_id: sessionId,
        payment_status: 'success'
      });
      
      setTimeout(() => {
        onSuccess({ 
          status: 'success', 
          booking_id: bookingData.payment_info.booking_id 
        });
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-green-600 text-white p-4">
          <h2 className="text-xl font-bold">Complete Your Payment</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Name:</span> {bookingData.invoice.customer_name}</p>
              <p><span className="font-medium">Booking ID:</span> {bookingData.invoice.booking_id}</p>
              <p><span className="font-medium">Tickets:</span> {bookingData.invoice.booking_details.number_of_tickets}</p>
              <p><span className="font-medium">Subtotal:</span> ₹{bookingData.invoice.booking_details.subtotal.toFixed(2)}</p>
              <p><span className="font-medium">GST (18%):</span> ₹{bookingData.invoice.booking_details.gst.toFixed(2)}</p>
              <p className="text-lg font-bold mt-2">
                <span className="font-medium">Total:</span> ₹{bookingData.invoice.booking_details.grand_total.toFixed(2)}
              </p>
            </div>
          </div>
          
          {paymentStatus === 'idle' && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center space-x-3 p-2 border rounded bg-gray-50">
                  <CreditCard className="text-gray-600" />
                  <span>Credit/Debit Card (Simulated)</span>
                </div>
              </div>
              
              <button
                onClick={handleProcessPayment}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Pay Now</span>
                <ArrowRight size={18} />
              </button>
              
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Processing Payment...</p>
              <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 bg-green-100 rounded-full p-3 inline-block">
                <CheckCircle size={36} className="text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Payment Successful!</p>
              <p className="text-sm text-gray-500 mt-2">Your booking is confirmed</p>
            </div>
          )}
          
          {paymentStatus === 'error' && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 bg-red-100 rounded-full p-3 inline-block">
                <XCircle size={36} className="text-red-600" />
              </div>
              <p className="text-lg font-medium text-gray-700">Payment Failed</p>
              <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
              <button
                onClick={() => {
                  setPaymentStatus('idle');
                  setErrorMessage('');
                }}
                className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingSummary() {
  const [activeTab, setActiveTab] = useState('info');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-700 text-white p-4">
        <h2 className="text-lg font-semibold">Safari Information</h2>
      </div>
      
      <div className="border-b">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'info' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500'}`}
            onClick={() => setActiveTab('info')}
          >
            Safari Info
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'help' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500'}`}
            onClick={() => setActiveTab('help')}
          >
            Help
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Safari Details</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-medium">Location:</span>
                  <span>National Wildlife Sanctuary</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-medium">Schedule:</span>
                  <span>Morning: 6:00 AM - 9:00 AM<br />Evening: 3:30 PM - 6:30 PM</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-medium">Price:</span>
                  <span>₹500 per person (plus 18% GST)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-medium">Duration:</span>
                  <span>3 hours per safari</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
              <p className="text-gray-700">
                Encounter majestic tigers, elephants, leopards and diverse wildlife in their natural habitat.
                Our experienced guides will help you spot animals and learn about the ecosystem.
              </p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Important Note</h3>
              <p className="text-sm text-green-700">
                Please arrive 30 minutes before your scheduled safari time. Bring binoculars, water, and wear 
                earth-toned clothing for the best experience.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'help' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">FAQ</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-700">How do I cancel my booking?</h4>
                  <p className="text-sm text-gray-600">You can cancel up to 48 hours before your safari for a full refund.</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700">Is food provided?</h4>
                  <p className="text-sm text-gray-600">Light refreshments are available, but we recommend bringing your own water.</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700">Are children allowed?</h4>
                  <p className="text-sm text-gray-600">Yes, children of all ages are welcome, but must be accompanied by an adult.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
              <p className="text-gray-700 mb-2">
                If you need additional assistance, please contact our support team:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><span className="font-medium">Phone:</span> +91 8800 123456</p>
                <p><span className="font-medium">Email:</span> support@junglesafari.com</p>
                <p><span className="font-medium">Hours:</span> 9:00 AM - 6:00 PM (Mon-Sat)</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowComplaintForm(true)}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors mt-2"
            >
              Report an Issue
            </button>
          </div>
        )}
      </div>
      
      {showComplaintForm && (
        <ComplaintModal onClose={() => setShowComplaintForm(false)} />
      )}
    </div>
  );
}

function ComplaintModal({ onClose }) {
  const [complaint, setComplaint] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaint.trim()) {
      setErrorMessage('Please describe your issue');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Send complaint to backend
      await axios.post(`${API_BASE_URL}/complaint`, {
        name,
        email,
        booking_id: booking,
        message: complaint
      });
      
      // Show success message
      setIsSuccess(true);
      
      // Close the modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setErrorMessage('Failed to submit your complaint. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-yellow-500 text-white p-4">
          <h2 className="text-xl font-bold">Report an Issue</h2>
        </div>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label htmlFor="booking" className="block text-sm font-medium text-gray-700 mb-1">Booking ID (optional)</label>
              <input
                type="text"
                id="booking"
                value={booking}
                onChange={(e) => setBooking(e.target.value)}
                placeholder="If applicable"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-1">Describe Your Issue</label>
              <textarea
                id="complaint"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Please provide details about the issue you encountered"
                rows={4}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errorMessage}
                </p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:bg-yellow-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 bg-green-100 rounded-full p-3 inline-block">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your complaint has been submitted successfully. Our team will review and respond to you shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center text-gray-500 text-sm">
      <p>© 2025 Jungle Safari Booking | All Rights Reserved</p>
      <p className="mt-1">Designed for wildlife enthusiasts</p>
    </footer>
  );
}

export default App;