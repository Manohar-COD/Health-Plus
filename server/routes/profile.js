const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, profile, goals } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile.toObject(), ...profile };
    if (goals) user.goals = { ...user.goals.toObject(), ...goals };

    await user.save();
    res.json({ message: 'Profile updated', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
