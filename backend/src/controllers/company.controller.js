import Company from '../models/company.model.js';
import Room from '../models/room.model.js';
import Queue from '../models/queue.model.js';

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { companies }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get associated room and queue info
    const room = await Room.findOne({ company: company._id }).populate('assignedCommittee');
    const queue = await Queue.findOne({ company: company._id });

    res.json({
      success: true,
      data: { 
        company,
        room,
        queue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: { company }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      message: 'Company deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};