import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    filiere: { type: String },
    ecole: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    internshipStatus: { type: String },
    cvFile: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      uploadDate: { type: Date, default: Date.now },
    },
    verified: Boolean,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema, 'utilisateurs');