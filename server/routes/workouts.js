const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workout = require('../models/Workout');

// @route GET /api/workouts
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const workouts = await Workout.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(days));
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/workouts/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const workouts = await Workout.find({ user: req.user.id, date: today });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/workouts
router.post('/', auth, async (req, res) => {
  try {
    const { name, exercises, totalDuration, totalCalories, notes, rating } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const workout = new Workout({
      user: req.user.id,
      name: name || 'Workout Session',
      date: today,
      exercises: exercises || [],
      totalDuration: totalDuration || 0,
      totalCalories: totalCalories || 0,
      notes,
      rating: rating || 3
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/workouts/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user.id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    Object.assign(workout, req.body);
    await workout.save();
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/workouts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/workouts/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 }).limit(30);
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((s, w) => s + w.totalDuration, 0);
    const totalCalories = workouts.reduce((s, w) => s + w.totalCalories, 0);
    const avgRating = totalWorkouts ? workouts.reduce((s, w) => s + w.rating, 0) / totalWorkouts : 0;

    res.json({ totalWorkouts, totalMinutes, totalCalories, avgRating: avgRating.toFixed(1) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
