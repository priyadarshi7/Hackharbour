import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Avatar, 
  CircularProgress,
  Container,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';

const ComplaintBot = () => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm here to help with your complaint about Jungle Safari. Please describe your issue, and I'll gather all the necessary details.", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("session_" + Date.now());
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send message to backend - using the correct endpoint format
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId
        }),
      });

      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { 
        text: data.response, 
        sender: 'bot',
        complaint: data.complaint_logged ? {
          category: data.complaint_category,
          severity: data.severity
        } : null
      }]);
      
      // If this was the last message in a complaint sequence, show confirmation
      if (data.complaint_logged) {
        console.log("Complaint logged successfully:", {
          category: data.complaint_category,
          severity: data.severity
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting to our system. Please try again later.", 
        sender: 'bot',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container maxWidth="md" className="mt-8">
      <Paper elevation={3} className="overflow-hidden">
        <Box className="bg-green-700 p-4 text-white">
          <Typography variant="h6" className="flex items-center gap-2">
            <SupportAgentIcon /> Jungle Safari Support
          </Typography>
        </Box>
        
        {/* Messages Area */}
        <Box className="h-96 p-4 overflow-y-auto bg-gray-50">
          {messages.map((message, index) => (
            <Box
              key={index}
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Stack direction="row" spacing={2} className={`max-w-3/4 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {message.sender === 'bot' && (
                  <Avatar className="bg-green-700">
                    <SupportAgentIcon />
                  </Avatar>
                )}
                
                <Paper
                  className={`p-3 ${
                    message.sender === 'user'
                      ? 'bg-green-100'
                      : message.error
                      ? 'bg-red-100'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                  
                  {message.complaint && (
                    <Typography variant="caption" className="mt-2 block text-gray-500">
                      Complaint logged: {message.complaint.category} (Severity: {message.complaint.severity})
                    </Typography>
                  )}
                </Paper>
                
                {message.sender === 'user' && (
                  <Avatar className="bg-gray-700">
                    <PersonIcon />
                  </Avatar>
                )}
              </Stack>
            </Box>
          ))}
          {loading && (
            <Box className="flex justify-start mb-4">
              <Stack direction="row" spacing={2} className="items-end">
                <Avatar className="bg-green-700">
                  <SupportAgentIcon />
                </Avatar>
                <CircularProgress size={24} className="ml-2 mb-2" />
              </Stack>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input Area */}
        <Box className="p-4 border-t border-gray-200 flex">
          <TextField
            fullWidth
            placeholder="Type your message here..."
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            disabled={loading}
          />
          <Button
            color="success"
            variant="contained"
            endIcon={<SendIcon />}
            onClick={sendMessage}
            disabled={loading || input.trim() === ''}
            className="ml-2 h-14"
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComplaintBot;