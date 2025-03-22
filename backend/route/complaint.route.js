// routes/complaintRoutes.js


import express from 'express';
import { chat, getComplaints, updateComplaint } from '../controller/complaint.controller.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', chat);

// Get all complaints (admin)
router.get('/', getComplaints);

// Update complaint status
router.put('/:id', updateComplaint);

export default router