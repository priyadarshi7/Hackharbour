import React, { useState, useEffect, useRef } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  useMediaQuery,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { ParkOutlined } from '@mui/icons-material';
import ChatInterface from '../../components/ChatInterface';
import PaymentModal from '../../components/PaymentModal';
import InvoiceView from '../../components/InvoiceView';
import './JungleSafariChat.css'

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      {...other}
    >
      {value === index && <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>{children}</Box>}
    </div>
  );
}

function JungleSafariChat() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#047857',
          },
          secondary: {
            main: '#0ea5e9',
          },
          background: {
            default: prefersDarkMode ? '#0f172a' : '#f0fdf4',
            paper: prefersDarkMode ? '#1e293b' : '#ffffff',
          },
        },
      }),
    [prefersDarkMode],
  );

  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Welcome to Jungle Safari! I can help you book tickets for an unforgettable wildlife experience. Would you like to start booking now?'
    }
  ]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const messagesEndRef = useRef(null);

  // Generate a session ID if none exists
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}`);
    }
  }, [sessionId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const sendMessage = async (message) => {
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: message }]);
    setLoading(true);

    try {
      // Send message to backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId
        }),
      });

      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      
      // Handle payment info if present
      if (data.payment_info) {
        setPaymentInfo(data.payment_info);
        setInvoice(data.invoice);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Check payment status with backend
      const response = await fetch(`http://localhost:8000/check-payment/${paymentInfo.booking_id}/${paymentIntentId}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPaymentStatus('success');
        setShowPayment(false);
        setShowInvoice(true);
        
        // Add confirmation message to chat
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Great news! Your payment was successful. Your booking ID is ${paymentInfo.booking_id}. You can view your invoice and booking details anytime.` 
        }]);
      } else {
        setPaymentStatus('failed');
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `There was an issue with your payment. Status: ${data.payment_status}. Please try again or contact support.` 
        }]);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentStatus('error');
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setMessages(prev => [...prev, { 
      type: 'bot', 
      content: 'Your payment was cancelled. Would you like to try again or have any questions?' 
    }]);
  };

  const closeInvoice = () => {
    setShowInvoice(false);
  };

  const submitComplaint = async (message) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      // Switch back to chat tab after submitting complaint
      setTabValue(0);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error processing your complaint. Please try again later.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerPaymentModalForTesting = () => {
    // Create a sample payment info object for testing
    const testPaymentInfo = {
      booking_id: `test_${Date.now()}`,
      amount: 159900, // ₹1599.00 in paise
      email: "test@example.com",
      name: "Test User",
      description: "Jungle Safari - 2 Adult Tickets"
    };
    
    setPaymentInfo(testPaymentInfo);
    setShowPayment(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen flex flex-col">
        <AppBar position="static" color="primary">
          <Toolbar>
            <ParkOutlined sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Jungle Safari Booking
            </Typography>
            {/* Testing Button for Payment Modal */}
            {process.env.NODE_ENV === 'development' && (
              <Box component="button" 
                onClick={triggerPaymentModalForTesting}
                sx={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: 'white',
                  px: 2, 
                  py: 1, 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { background: 'rgba(255,255,255,0.3)' }
                }}
              >
                Test Payment
              </Box>
            )}
          </Toolbar>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ bgcolor: 'primary.dark' }}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: "#fff" },
            }}
          >
            <Tab label="Chat" sx={{ color: "white" }} />
            <Tab label="Submit Complaint" sx={{ color: "white" }} />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ flex: 1, py: 3, display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={3}
            sx={{
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 2,
              flex: 1,
            }}
          >
            <TabPanel value={tabValue} index={0}>
              <ChatInterface 
                messages={messages} 
                onSendMessage={sendMessage} 
                loading={loading} 
                messagesEndRef={messagesEndRef}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <ChatInterface 
                isComplaintMode={true}
                messages={[]} 
                onSendMessage={submitComplaint} 
                loading={loading} 
                messagesEndRef={null}
                complaintPlaceholder="Please describe your issue in detail..."
                complaintSubmitLabel="Submit Complaint"
              />
            </TabPanel>
          </Paper>
        </Container>

        {showPayment && paymentInfo && (
          <PaymentModal 
            paymentInfo={paymentInfo} 
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            open={showPayment}
          />
        )}

        {showInvoice && invoice && (
          <InvoiceView 
            invoice={invoice} 
            onClose={closeInvoice}
            open={showInvoice}
          />
        )}

        <Box component="footer" sx={{ 
          bgcolor: 'primary.dark', 
          color: 'white', 
          p: 2, 
          textAlign: 'center',
          mt: 'auto'
        }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Jungle Safari. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default JungleSafariChat;