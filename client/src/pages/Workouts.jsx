import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dumbbell, Plus, Trash2, Calendar, Play, Pause, RotateCcw, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Timer states
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Form states
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  // Individual exercise states
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [exDuration, setExDuration] = useState('');

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/workouts');
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load workout logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, []);

  // Timer Handlers
  const handleStartPause = () => {
    if (timerRunning) {
      clearInterval(timerIntervalId);
      setTimerRunning(false);
    } else {
      const id = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      setTimerIntervalId(id);
      setTimerRunning(true);
    }
  };

  const handleReset = () => {
    clearInterval(timerIntervalId);
    setTimerRunning(false);
    setDuration(Math.round(time / 60)); // Auto-populate duration
    // Calculate approximate calorie burn: ~8 kcal/minute
    setCaloriesBurned(Math.round((time / 60) * 8));
    setTime(0);
  };

  // Add individual exercise to builder
  const handleAddExerciseToBuilder = () => {
    if (!exerciseName) return;
    const newEx = {
      name: exerciseName,
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0,
      duration: parseInt(exDuration) || 0
    };
    setExercises([...exercises, newEx]);
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
    setExDuration('');
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    if (!workoutName) return;

    try {
      const payload = {
        name: workoutName,
        exercises,
        totalDuration: parseInt(duration) || 0,
        totalCalories: parseInt(caloriesBurned) || 0,
        notes,
        rating
      };

      const res = await axios.post('/api/workouts', payload);
      setWorkouts([res.data, ...workouts]);

      // Reset
      setWorkoutName('');
      setExercises([]);
      setDuration('');
      setCaloriesBurned('');
      setNotes('');
      setRating(3);

      toast.success('Workout logged successfully!');
    } catch (err) {
      toast.error('Failed to save workout.');
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await axios.delete(`/api/workouts/${id}`);
      setWorkouts(workouts.filter((w) => w._id !== id));
      toast.success('Workout deleted.');
    } catch (err) {
      toast.error('Failed to delete workout.');
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Workout Logger</h1>
          <p style={styles.subtitle}>Track exertion, start live workout timer, log individual exercises, and view volume logs.</p>
        </div>
        <div style={styles.dateBadge} className="glass-panel">
          <Calendar size={16} />
          <span>Today</span>
        </div>
      </header>

      <div style={styles.grid}>
        
        {/* Left Column: Live timer + Add workout */}
        <div style={styles.leftCol}>
          
          {/* Live Workout Timer Widget */}
          <div style={styles.card} className="glass-panel pulse-primary">
            <h2 style={styles.cardTitle}>Live Workout Session Timer</h2>
            <div style={styles.timerDisplayWrapper}>
              <div style={styles.timeVal}>{formatTime(time)}</div>
              <div style={styles.timerControls}>
                <button onClick={handleStartPause} style={{ ...styles.controlBtn, backgroundColor: timerRunning ? 'var(--danger)' : 'var(--success)' }}>
                  {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={handleReset} style={{ ...styles.controlBtn, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Log New Workout Form */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Log Workout Session</h2>
            <form onSubmit={handleSaveWorkout} style={styles.form}>
              
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flexGrow: 2 }}>
                  <label className="form-label">Session Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g. Hypertrophy Upper Body A"
                    required
                  />
                </div>
                <div style={{ ...styles.formGroup, flexGrow: 1 }}>
                  <label className="form-label">Intensity Rating</label>
                  <select 
                    style={styles.select}
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  >
                    <option value={5}>5 - Maximum Exertion</option>
                    <option value={4}>4 - Hard Session</option>
                    <option value={3}>3 - Moderate Work</option>
                    <option value={2}>2 - Light Active Recovery</option>
                    <option value={1}>1 - Low Intensity</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Exercise Builder */}
              <div style={styles.builderCard}>
                <h4 style={styles.builderTitle}>Exercise Builder</h4>
                <div style={styles.builderInputs}>
                  <input 
                    type="text" 
                    placeholder="Exercise Name" 
                    style={styles.builderInput} 
                    value={exerciseName} 
                    onChange={(e) => setExerciseName(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    placeholder="Sets" 
                    style={styles.builderInput} 
                    value={sets} 
                    onChange={(e) => setSets(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    placeholder="Reps" 
                    style={styles.builderInput} 
                    value={reps} 
                    onChange={(e) => setReps(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    placeholder="Weight (kg)" 
                    style={styles.builderInput} 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddExerciseToBuilder} 
                    style={styles.builderAddBtn}
                    className="btn-primary"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {exercises.length > 0 && (
                  <div style={styles.builderList}>
                    {exercises.map((ex, idx) => (
                      <div key={idx} style={styles.builderItem}>
                        <span>{ex.name}</span>
                        <span>{ex.sets} sets × {ex.reps} reps ({ex.weight} kg)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 45"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Calories Burned (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    placeholder="e.g. 350"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Session Notes / Observations</label>
                <textarea 
                  className="form-input" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Highlight active volume, performance, fatigue levels."
                  rows={2}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
                <Plus size={18} />
                <span>Log Session</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Workout History List */}
        <div style={styles.rightCol}>
          
          <div style={{ ...styles.card, minHeight: '100%' }} className="glass-panel">
            <h2 style={styles.cardTitle}>Recent Workout Sessions</h2>
            
            <div style={styles.workoutsList}>
              {workouts.map((w) => (
                <div key={w._id} style={styles.workoutItem}>
                  <div style={styles.workoutHeader}>
                    <div style={styles.workoutInfo}>
                      <h4 style={styles.workoutName}>{w.name}</h4>
                      <span style={styles.workoutDate}>{w.date}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteWorkout(w._id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={styles.workoutStatsRow}>
                    <span style={styles.workoutStat}>⏱️ {w.totalDuration} mins</span>
                    <span style={styles.workoutStat}>🔥 {w.totalCalories} kcal</span>
                    <span style={styles.workoutStat}>⭐ Intensity: {w.rating}/5</span>
                  </div>

                  {w.exercises && w.exercises.length > 0 && (
                    <div style={styles.exerciseList}>
                      {w.exercises.map((ex, idx) => (
                        <div key={idx} style={styles.exerciseItem}>
                          <span style={styles.exName}>{ex.name}</span>
                          <span style={styles.exDetails}>{ex.sets} sets × {ex.reps} reps ({ex.weight} kg)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {workouts.length === 0 && (
                <div style={styles.emptyWorkouts}>
                  <Dumbbell size={36} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                  <h3>No Workouts Logged</h3>
                  <p>Establish a regular dynamic workout, boot up the live timer, and log your reps!</p>
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
    gridTemplateColumns: '1.25fr 1fr',
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
    marginBottom: '20px',
  },
  timerDisplayWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
  },
  timeVal: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.5rem',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '0.05em',
  },
  timerControls: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  controlBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition)',
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
  builderCard: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
  },
  builderTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
  },
  builderInputs: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.2fr auto',
    gap: '8px',
    alignItems: 'center',
  },
  builderInput: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  builderAddBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
  builderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  builderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '6px 10px',
    borderRadius: '4px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  submitBtn: {
    padding: '12px',
  },
  workoutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '12px',
  },
  workoutItem: {
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  workoutHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  workoutName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
  },
  workoutDate: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
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
  },
  workoutStatsRow: {
    display: 'flex',
    gap: '12px',
    margin: '12px 0 0 0',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  workoutStat: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  exName: {
    color: '#fff',
    fontWeight: '500',
  },
  exDetails: {
    color: 'var(--text-secondary)',
  },
  emptyWorkouts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text-secondary)',
    gap: '12px',
  },
};

export default Workouts;
