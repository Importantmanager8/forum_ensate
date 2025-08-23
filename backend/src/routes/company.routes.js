import express from 'express';
import Company from '../models/company.model.js';
import Room from '../models/room.model.js';
import Queue from '../models/queue.model.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get all companies
router.get('/', authenticate, async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single company by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new company
router.post('/', authenticate, async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    // Auto-create a queue for the new company
    // Assign the first available room (or null if none)
    const room = await Room.findOne();
    await Queue.create({
      company: company._id,
      room: room ? room._id : null
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a company
router.put('/:id', authenticate, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a company
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign a company to a room
router.post('/:id/assign-room', authenticate, async (req, res) => {
  try {
    const { roomId } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.company = company._id;
    await room.save();
    res.json({ message: 'Company assigned to room', room });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;