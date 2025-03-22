import dotenv from 'dotenv';
import Complaint from '../model/complaint.model.js';

dotenv.config();

// In-memory session storage (for production use Redis/MongoDB)
const sessions = {};

// Function to categorize complaints
const categorizeComplaint = (message) => {
  // Categories for complaints
  const categories = [
    "animal welfare", "staff behavior", "facilities", "ticket issues", 
    "food services", "safety concerns", "cleanliness", "wait times",
    "photography issues", "tour guide experience", "product quality", "other"
  ];
  
  // Locations
  const locations = [
    "entrance", "safari route", "food court", "gift shop", 
    "animal enclosures", "restrooms", "parking", "viewing areas",
    "walking trails", "visitor center", "store", "unknown"
  ];
  
  // Simple keyword matching
  let category = "other";
  for (const c of categories) {
    if (message.toLowerCase().includes(c.toLowerCase())) {
      category = c;
      break;
    }
  }
  
  // Product quality for broken/damaged items
  if (message.toLowerCase().includes('broken') || 
      message.toLowerCase().includes('damaged') || 
      message.toLowerCase().includes('replace')) {
    category = "product quality";
  }
  
  let location = "unknown";
  for (const loc of locations) {
    if (message.toLowerCase().includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }
  
  if (message.toLowerCase().includes('store') || 
      message.toLowerCase().includes('order') || 
      message.toLowerCase().includes('purchase')) {
    location = "store";
  }
  
  // Extract potential date mentions
  let visit_date = null;
  if (message.toLowerCase().includes("yesterday")) {
    visit_date = "yesterday";
  } else if (message.toLowerCase().includes("last week")) {
    visit_date = "last week";
  } else if (message.toLowerCase().includes("today")) {
    visit_date = "today";
  }
  
  // Estimate severity based on keywords
  let severity = "medium";
  const high_urgency_words = ["dangerous", "unsafe", "emergency", "hurt", "injured", "terrible", "urgent", "immediately"];
  const low_urgency_words = ["minor", "small", "slight", "just wondering"];
  
  if (high_urgency_words.some(word => message.toLowerCase().includes(word))) {
    severity = "high";
  } else if (low_urgency_words.some(word => message.toLowerCase().includes(word))) {
    severity = "low";
  }
  
  // Extract name and contact info (basic implementation)
  let customer_name = null;
  let contact_info = null;
  
  // Name extraction
  const nameIndicators = ["my name is", "i am", "this is"];
  for (const indicator of nameIndicators) {
    if (message.toLowerCase().includes(indicator)) {
      const startIdx = message.toLowerCase().indexOf(indicator) + indicator.length;
      let endIdx = message.indexOf(" ", startIdx + 10);
      if (endIdx === -1) {
        endIdx = message.length;
      }
      const potentialName = message.substring(startIdx, endIdx).trim();
      if (potentialName.length > 0 && potentialName.length < 30) {
        customer_name = potentialName;
      }
    }
  }
  
  // Contact info extraction
  if (message.includes("@")) {
    const words = message.split(/\s+/);
    for (const word of words) {
      if (word.includes("@")) {
        contact_info = word;
      }
    }
  }
  
  // Extract phone numbers (simple regex)
  const phoneRegex = /(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10})/g;
  const phoneMatches = message.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    contact_info = phoneMatches[0];
  }
  
  return {
    issue_category: category,
    location_in_park: location,
    visit_date: visit_date,
    severity: severity,
    customer_name: customer_name,
    contact_info: contact_info
  };
};

// Chat endpoint
const chat = async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    // Generate a session ID if not provided
    const currentSessionId = session_id || `session_${Date.now()}`;
    
    // Initialize session memory if it doesn't exist
    if (!sessions[currentSessionId]) {
      sessions[currentSessionId] = {
        messages: [],
        complaintInfo: {}
      };
    }
    
    // Add user message to session
    sessions[currentSessionId].messages.push({
      role: 'user',
      content: message
    });
    
    // Extract complaint information
    const complaintInfo = categorizeComplaint(message);
    
    // Update session complaint info
    sessions[currentSessionId].complaintInfo = {
      ...sessions[currentSessionId].complaintInfo,
      ...complaintInfo
    };
    
    // Generate chatbot response
    let botResponse = '';

    // Missing information collection
    const missingInfo = [];
    if (!complaintInfo.customer_name) missingInfo.push('name');
    if (!complaintInfo.contact_info) missingInfo.push('contact');
    if (!complaintInfo.visit_date && complaintInfo.issue_category !== 'product quality') {
      missingInfo.push('date');
    }
    
    // First response should acknowledge the complaint
    if (sessions[currentSessionId].messages.length <= 1) {
      botResponse = `Thank you for reaching out. I understand you have a concern about ${complaintInfo.issue_category}.`;
    } 
    // Follow up to collect missing info
    else if (missingInfo.length > 0) {
      botResponse = `Could you please provide your ${missingInfo[0]}?`;
    }
    // Confirm complaint submission
    else {
      botResponse = `Thank you. We've recorded your complaint regarding ${complaintInfo.issue_category}.`;
      
      if (complaintInfo.severity === 'high') {
        botResponse += " Our team will prioritize this.";
      }
      
      botResponse += ` We will contact you at ${complaintInfo.contact_info}.`;
      
      // Save complaint to database
      const complaintData = {
        message: message,
        ...sessions[currentSessionId].complaintInfo,
        timestamp: new Date().toISOString(),
        status: 'new',
        session_id: currentSessionId
      };
      
      const complaint = new Complaint(complaintData);
      await complaint.save();
    }
    
    // Add bot response to session
    sessions[currentSessionId].messages.push({
      role: 'assistant',
      content: botResponse
    });
    
    return res.status(200).json({
      response: botResponse,
      session_id: currentSessionId
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ timestamp: -1 });
    return res.status(200).json({ complaints });
  } catch (error) {
    console.error('Error retrieving complaints:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update complaint status
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, resolution } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = status || complaint.status;
    complaint.assigned_to = assigned_to || complaint.assigned_to;
    if (resolution) complaint.resolution = resolution;

    await complaint.save();
    
    return res.status(200).json({ success: true, updated_complaint: complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { chat, getComplaints, updateComplaint };
