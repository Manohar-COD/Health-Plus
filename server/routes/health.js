const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthLog = require('../models/HealthLog');
const User = require('../models/User');

// Calculate health score from a log entry
function calculateHealthScore(log, goals) {
  let score = 0;
  const maxScore = 100;

  // Calories (25 points) - within 80-110% of goal
  if (log.nutrition && goals.calories) {
    const calRatio = log.nutrition.totalCalories / goals.calories;
    if (calRatio >= 0.8 && calRatio <= 1.1) score += 25;
    else if (calRatio >= 0.6 && calRatio <= 1.3) score += 15;
    else score += 5;
  }

  // Water (20 points)
  if (log.hydration && goals.water) {
    const waterRatio = log.hydration.totalWater / goals.water;
    if (waterRatio >= 1) score += 20;
    else score += Math.floor(waterRatio * 20);
  }

  // Sleep (25 points)
  if (log.sleep && log.sleep.duration > 0) {
    const sleepRatio = log.sleep.duration / goals.sleep;
    if (sleepRatio >= 0.875 && sleepRatio <= 1.125) score += 25;
    else if (sleepRatio >= 0.75) score += 15;
    else score += 5;
    // Quality bonus
    if (log.sleep.quality >= 4) score += 5;
  }

  // Steps (15 points)
  if (log.steps && goals.steps) {
    const stepRatio = log.steps / goals.steps;
    score += Math.min(15, Math.floor(stepRatio * 15));
  }

  // Mood bonus (15 points)
  if (log.mood) {
    score += (log.mood - 1) * 3.75;
  }

  return Math.min(maxScore, Math.round(score));
}

// Generate AI insights
function generateInsights(logs, goals) {
  const insights = [];
  if (!logs || logs.length === 0) return [{ type: 'info', title: 'Start Tracking', message: 'Log your first health data to receive personalized insights!', icon: '🚀' }];

  const recent = logs.slice(0, 7);

  // Calorie analysis
  const avgCals = recent.reduce((sum, l) => sum + (l.nutrition?.totalCalories || 0), 0) / recent.length;
  if (avgCals < goals.calories * 0.7) {
    insights.push({ type: 'warning', title: 'Low Calorie Intake', message: `You're averaging ${Math.round(avgCals)} kcal/day. Aim for ${goals.calories} kcal for optimal energy.`, icon: '⚠️' });
  } else if (avgCals > goals.calories * 1.2) {
    insights.push({ type: 'warning', title: 'Calorie Surplus', message: `Your average intake (${Math.round(avgCals)} kcal) exceeds your goal. Consider adjusting portion sizes.`, icon: '🍽️' });
  } else {
    insights.push({ type: 'success', title: 'Nutrition on Track', message: `Great job! Your calorie intake is well within your goal range.`, icon: '✅' });
  }

  // Hydration analysis
  const avgWater = recent.reduce((sum, l) => sum + (l.hydration?.totalWater || 0), 0) / recent.length;
  if (avgWater < goals.water * 0.75) {
    insights.push({ type: 'warning', title: 'Stay Hydrated', message: `You're only averaging ${avgWater.toFixed(1)} glasses/day. Dehydration affects energy and focus.`, icon: '💧' });
  } else {
    insights.push({ type: 'success', title: 'Great Hydration', message: `You're meeting your water intake goals. Keep it up!`, icon: '💧' });
  }

  // Sleep analysis
  const avgSleep = recent.reduce((sum, l) => sum + (l.sleep?.duration || 0), 0) / recent.length;
  if (avgSleep < 6) {
    insights.push({ type: 'danger', title: 'Sleep Deficit Detected', message: `You're averaging only ${avgSleep.toFixed(1)} hours of sleep. Chronic sleep deprivation impacts health significantly.`, icon: '😴' });
  } else if (avgSleep >= 7 && avgSleep <= 9) {
    insights.push({ type: 'success', title: 'Excellent Sleep Pattern', message: `Your ${avgSleep.toFixed(1)} hour average is in the optimal range. Well done!`, icon: '🌙' });
  }

  // Health score trend
  const avgScore = recent.reduce((sum, l) => sum + (l.healthScore || 0), 0) / recent.length;
  if (avgScore >= 75) {
    insights.push({ type: 'success', title: 'Top Performer', message: `Your average health score of ${Math.round(avgScore)} is excellent! You're in the top tier.`, icon: '🏆' });
  } else if (avgScore >= 50) {
    insights.push({ type: 'info', title: 'Good Progress', message: `Average health score: ${Math.round(avgScore)}. Focus on hydration and sleep to push higher.`, icon: '📈' });
  }

  return insights.slice(0, 4);
}

// @route GET /api/health/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) {
      log = new HealthLog({ user: req.user.id, date: today });
      await log.save();
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/health/logs
router.get('/logs', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const logs = await HealthLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(days));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/health/insights
router.get('/insights', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const logs = await HealthLog.find({ user: req.user.id }).sort({ date: -1 }).limit(7);
    const insights = generateInsights(logs, user.goals);
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/health/nutrition
router.put('/nutrition', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { meal } = req.body;

    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) log = new HealthLog({ user: req.user.id, date: today });

    log.nutrition.meals.push(meal);
    log.nutrition.totalCalories = log.nutrition.meals.reduce((s, m) => s + (m.calories || 0), 0);
    log.nutrition.totalProtein = log.nutrition.meals.reduce((s, m) => s + (m.protein || 0), 0);
    log.nutrition.totalCarbs = log.nutrition.meals.reduce((s, m) => s + (m.carbs || 0), 0);
    log.nutrition.totalFat = log.nutrition.meals.reduce((s, m) => s + (m.fat || 0), 0);

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/health/nutrition/:mealId
router.delete('/nutrition/:mealId', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) return res.status(404).json({ message: 'Log not found' });

    log.nutrition.meals = log.nutrition.meals.filter(m => m._id.toString() !== req.params.mealId);
    log.nutrition.totalCalories = log.nutrition.meals.reduce((s, m) => s + (m.calories || 0), 0);
    log.nutrition.totalProtein = log.nutrition.meals.reduce((s, m) => s + (m.protein || 0), 0);
    log.nutrition.totalCarbs = log.nutrition.meals.reduce((s, m) => s + (m.carbs || 0), 0);
    log.nutrition.totalFat = log.nutrition.meals.reduce((s, m) => s + (m.fat || 0), 0);

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/health/water
router.put('/water', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { glasses = 1, ml = 250 } = req.body;

    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) log = new HealthLog({ user: req.user.id, date: today });

    log.hydration.entries.push({ amount: ml, time: new Date() });
    log.hydration.totalWater += glasses;
    log.hydration.totalMl += ml;

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/health/sleep
router.put('/sleep', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { bedtime, wakeTime, duration, quality, notes } = req.body;

    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) log = new HealthLog({ user: req.user.id, date: today });

    log.sleep = { bedtime, wakeTime, duration, quality, notes };

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    // Update streak
    await updateStreak(user, today);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/health/steps
router.put('/steps', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { steps } = req.body;

    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) log = new HealthLog({ user: req.user.id, date: today });

    log.steps = steps;

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/health/mood
router.put('/mood', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { mood } = req.body;

    let log = await HealthLog.findOne({ user: req.user.id, date: today });
    if (!log) log = new HealthLog({ user: req.user.id, date: today });

    log.mood = mood;

    const user = await User.findById(req.user.id);
    log.healthScore = calculateHealthScore(log, user.goals);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function updateStreak(user, today) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (user.lastLogDate === yesterdayStr) {
    user.streak += 1;
  } else if (user.lastLogDate !== today) {
    user.streak = 1;
  }
  user.lastLogDate = today;
  await user.save();
}

module.exports = router;
