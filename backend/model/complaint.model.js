// models/Complaint.js
import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  customer_name: {
    type: String,
    default: null
  },
  contact_info: {
    type: String,
    default: null
  },
  visit_date: {
    type: String,
    default: null
  },
  issue_category: {
    type: String,
    default: 'other',
    enum: ['animal welfare', 'staff behavior', 'facilities', 'ticket issues', 
      'food services', 'safety concerns', 'cleanliness', 'wait times',
      'photography issues', 'tour guide experience', 'product quality', 'other']
  },
  severity: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  location_in_park: {
    type: String,
    default: 'unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'in-progress', 'resolved', 'closed']
  },
  assigned_to: {
    type: String,
    default: null
  },
  resolution: {
    type: String,
    default: null
  },
  resolution_date: {
    type: Date,
    default: null
  },
  session_id: {
    type: String,
    required: true
  }
});

const complaintModel = mongoose.model('Complaint', ComplaintSchema);

export default complaintModel