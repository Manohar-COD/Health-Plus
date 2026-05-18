const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  goals: {
    calories: { type: Number, default: 2000 },
    water: { type: Number, default: 8 },
    sleep: { type: Number, default: 8 },
    steps: { type: Number, default: 10000 }
  },
  profile: {
    age: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    gender: { type: String, default: '' },
    activityLevel: { type: String, default: 'moderate' }
  },
  streak: { type: Number, default: 0 },
  lastLogDate: { type: Date, default: null },
  healthScore: { type: Number, default: 50 },
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
