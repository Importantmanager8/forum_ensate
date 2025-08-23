import express from 'express';
import Interview from '../models/interview.model.js';
const router = express.Router();

// Obtenir toutes les interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer une nouvelle interview
router.post('/', async (req, res) => {
  const interview = new Interview({
    candidate: req.body.candidate,
    company: req.body.company,
    date: req.body.date,
    // Ajoute d'autres champs selon ton modèle
  });
  try {
    const newInterview = await interview.save();
    res.status(201).json(newInterview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir une interview par ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une interview
router.put('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une interview
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
