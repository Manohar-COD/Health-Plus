import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Apple, Plus, Trash2, Calendar, Target, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Nutrition = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [totalCals, setTotalCals] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  // Form fields
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealTime, setMealTime] = useState('breakfast');

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/health/today');
      setMeals(res.data.nutrition?.meals || []);
      setTotalCals(res.data.nutrition?.totalCalories || 0);
      setMacros({
        protein: res.data.nutrition?.totalProtein || 0,
        carbs: res.data.nutrition?.totalCarbs || 0,
        fat: res.data.nutrition?.totalFat || 0
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load nutrition log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    try {
      const meal = {
        name: mealName,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        time: mealTime
      };

      const res = await axios.put('/api/health/nutrition', { meal });
      setMeals(res.data.nutrition?.meals || []);
      setTotalCals(res.data.nutrition?.totalCalories || 0);
      setMacros({
        protein: res.data.nutrition?.totalProtein || 0,
        carbs: res.data.nutrition?.totalCarbs || 0,
        fat: res.data.nutrition?.totalFat || 0
      });

      // Clear form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      
      toast.success('Meal logged successfully!');
    } catch (err) {
      toast.error('Failed to log meal.');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await axios.delete(`/api/health/nutrition/${mealId}`);
      setMeals(res.data.nutrition?.meals || []);
      setTotalCals(res.data.nutrition?.totalCalories || 0);
      setMacros({
        protein: res.data.nutrition?.totalProtein || 0,
        carbs: res.data.nutrition?.totalCarbs || 0,
        fat: res.data.nutrition?.totalFat || 0
      });
      toast.success('Meal deleted.');
    } catch (err) {
      toast.error('Failed to delete meal.');
    }
  };

  const calGoal = user?.goals?.calories || 2000;
  const calPercent = Math.min(100, Math.round((totalCals / calGoal) * 100));

  // Custom macro goals estimation
  const proteinGoal = Math.round((calGoal * 0.3) / 4);
  const carbsGoal = Math.round((calGoal * 0.4) / 4);
  const fatGoal = Math.round((calGoal * 0.3) / 9);

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Nutrition Tracker</h1>
          <p style={styles.subtitle}>Log meals, inspect macronutrient values, and manage caloric surplus/deficits.</p>
        </div>
        <div style={styles.dateBadge} className="glass-panel">
          <Calendar size={16} />
          <span>Today</span>
        </div>
      </header>

      <div style={styles.grid}>
        
        {/* Left Side: Log Meals & Status Ring */}
        <div style={styles.leftCol}>
          
          {/* Calorie Progress Ring / Summary */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Calorie Balance</h2>
            <div style={styles.calOverview}>
              <div style={styles.progressContainer}>
                <div style={styles.bigNumber}>{totalCals}</div>
                <div style={styles.progressSub}>kcal consumed</div>
                <div style={styles.goalLine}>Goal: {calGoal} kcal</div>
              </div>
              <div style={styles.calRatioBarBg}>
                <div style={{ ...styles.calRatioBar, width: `${calPercent}%`, backgroundColor: totalCals > calGoal ? 'var(--danger)' : 'var(--primary)' }}></div>
              </div>
              <div style={styles.percentText}>{calPercent}% of Daily Target Completed</div>
            </div>
          </div>

          {/* Macronutrients breakdown */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Macronutrient Breakdown</h2>
            <div style={styles.macrosList}>
              {/* Protein */}
              <div style={styles.macroRow}>
                <div style={styles.macroLabelRow}>
                  <span style={styles.macroName}>Protein</span>
                  <span style={styles.macroValue}>{macros.protein}g / {proteinGoal}g</span>
                </div>
                <div style={styles.macroProgressBg}>
                  <div style={{ ...styles.macroProgress, width: `${Math.min(100, (macros.protein / proteinGoal) * 100)}%`, backgroundColor: '#f43f5e' }}></div>
                </div>
              </div>

              {/* Carbs */}
              <div style={styles.macroRow}>
                <div style={styles.macroLabelRow}>
                  <span style={styles.macroName}>Carbs</span>
                  <span style={styles.macroValue}>{macros.carbs}g / {carbsGoal}g</span>
                </div>
                <div style={styles.macroProgressBg}>
                  <div style={{ ...styles.macroProgress, width: `${Math.min(100, (macros.carbs / carbsGoal) * 100)}%`, backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>

              {/* Fat */}
              <div style={styles.macroRow}>
                <div style={styles.macroLabelRow}>
                  <span style={styles.macroName}>Fats</span>
                  <span style={styles.macroValue}>{macros.fat}g / {fatGoal}g</span>
                </div>
                <div style={styles.macroProgressBg}>
                  <div style={{ ...styles.macroProgress, width: `${Math.min(100, (macros.fat / fatGoal) * 100)}%`, backgroundColor: '#eab308' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Log New Meal Form */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Log a Meal</h2>
            <form onSubmit={handleAddMeal} style={styles.form}>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flexGrow: 2 }}>
                  <label className="form-label">Meal Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    placeholder="e.g. Avocado Toast & Eggs"
                    required
                  />
                </div>
                <div style={{ ...styles.formGroup, flexGrow: 1 }}>
                  <label className="form-label">Time</label>
                  <select 
                    style={styles.select}
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 450"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="e.g. 40"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fats (g)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="e.g. 12"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
                <Plus size={18} />
                <span>Log Entry</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Logged Meals History */}
        <div style={styles.rightCol}>
          
          <div style={{ ...styles.card, minHeight: '100%' }} className="glass-panel">
            <h2 style={styles.cardTitle}>Today's Meal Log</h2>
            
            <div style={styles.mealsList}>
              {meals.map((meal) => (
                <div key={meal._id} style={styles.mealItem}>
                  <div style={styles.mealLeft}>
                    <div style={styles.mealIconWrapper}>
                      <Apple size={18} color="var(--primary)" />
                    </div>
                    <div style={styles.mealInfo}>
                      <div style={styles.mealNameText}>{meal.name}</div>
                      <div style={styles.mealTimeBadge}>{meal.time}</div>
                    </div>
                  </div>

                  <div style={styles.mealRight}>
                    <div style={styles.mealMacros}>
                      <span>{meal.protein || 0}g P</span>
                      <span>{meal.carbs || 0}g C</span>
                      <span>{meal.fat || 0}g F</span>
                    </div>
                    <div style={styles.mealCals}>{meal.calories} kcal</div>
                    <button 
                      onClick={() => handleDeleteMeal(meal._id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {meals.length === 0 && (
                <div style={styles.emptyMeals}>
                  <Apple size={36} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                  <h3>No Meals Tracked Today</h3>
                  <p>Create your first meal log entry to start analyzing nutrition.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '100px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
  },
  calOverview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '16px 0',
  },
  progressContainer: {
    marginBottom: '20px',
  },
  bigNumber: {
    fontSize: '3.5rem',
    fontWeight: '900',
    color: '#fff',
    lineHeight: '1',
  },
  progressSub: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '6px',
  },
  goalLine: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: '600',
    marginTop: '4px',
  },
  calRatioBarBg: {
    width: '100%',
    height: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '100px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  calRatioBar: {
    height: '100%',
    borderRadius: '100px',
  },
  percentText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  macrosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  macroRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  macroLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  macroName: {
    color: '#fff',
  },
  macroValue: {
    color: 'var(--text-secondary)',
  },
  macroProgressBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  macroProgress: {
    height: '100%',
    borderRadius: '100px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  submitBtn: {
    padding: '12px',
  },
  mealsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
  },
  mealItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  mealLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mealIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  mealNameText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
  },
  mealTimeBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
    marginTop: '2px',
  },
  mealRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  mealMacros: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  mealCals: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
  emptyMeals: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text-secondary)',
    gap: '12px',
  },
};

export default Nutrition;
