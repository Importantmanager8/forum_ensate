import Joi from 'joi';
import {isStrongPassword} from "../utils/validatePassword.js"

const customPasswordValidator = (value, helpers) => {
  if (!isStrongPassword(value)) {
    return helpers.message(
      "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole."
    );
  }
  return value;
};

export const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().custom(customPasswordValidator).required(),
    role: Joi.string().valid('student').required(),
    filiere: Joi.string().required(),
    ecole: Joi.string().required(),
    internshipStatus: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
 
export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().custom(customPasswordValidator).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

export const validateCompany = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    website: Joi.string().uri(),
    estimatedInterviewDuration: Joi.number().min(5).max(120),
    maxDailyInterviews: Joi.number().min(1).max(200),
    contactEmail: Joi.string().email(),
    contactPhone: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};