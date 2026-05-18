const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  time: { type: String, default: 'breakfast' }
});

const waterEntrySchema = new mongoose.Schema({
  amount: { type: Number, default: 250 }, // ml
  time: { type: Date, default: Date.now }
});

const healthLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  nutrition: {
    meals: [mealSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 }
  },
  hydration: {
    entries: [waterEntrySchema],
    totalWater: { type: Number, default: 0 }, // glasses
    totalMl: { type: Number, default: 0 }
  },
  sleep: {
    bedtime: String,
    wakeTime: String,
    duration: { type: Number, default: 0 }, // hours
    quality: { type: Number, default: 3 }, // 1-5
    notes: String
  },
  steps: { type: Number, default: 0 },
  mood: { type: Number, default: 3 }, // 1-5
  weight: { type: Number, default: 0 },
  notes: String,
  healthScore: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for user + date uniqueness
healthLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
