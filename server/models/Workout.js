const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'strength' }, // strength, cardio, flexibility
  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 }, // kg
  duration: { type: Number, default: 0 }, // minutes
  distance: { type: Number, default: 0 }, // km
  calories: { type: Number, default: 0 }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, default: 'Workout Session' },
  date: { type: String, required: true }, // YYYY-MM-DD
  exercises: [exerciseSchema],
  totalDuration: { type: Number, default: 0 }, // minutes
  totalCalories: { type: Number, default: 0 },
  notes: String,
  rating: { type: Number, default: 3 } // 1-5
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
