import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  domaine: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  salle_affectee: {
    type: String,
    trim: true
  },
  stande: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema, 'entreprises');