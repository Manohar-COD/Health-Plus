import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Target, Shield, HeartPulse } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // States
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.profile?.age || '');
  const [weight, setWeight] = useState(user?.profile?.weight || '');
  const [height, setHeight] = useState(user?.profile?.height || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState(user?.profile?.activityLevel || 'moderate');

  // Goals
  const [waterGoal, setWaterGoal] = useState(user?.goals?.water || 8);
  const [sleepGoal, setSleepGoal] = useState(user?.goals?.sleep || 8);
  const [stepsGoal, setStepsGoal] = useState(user?.goals?.steps || 10000);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const payload = {
      name,
      profile: {
        age: parseInt(age) || 0,
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
        gender,
        activityLevel
      },
      goals: {
        water: parseInt(waterGoal) || 8,
        sleep: parseInt(sleepGoal) || 8,
        steps: parseInt(stepsGoal) || 10000
      }
    };

    const success = await updateProfile(payload);
    setIsUpdating(false);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>User Settings & Profile</h1>
          <p style={styles.subtitle}>Configure daily targets and body statistics to calibrate our insights system.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={styles.grid}>
        
        {/* Left Column: Personal info */}
        <div style={styles.leftCol}>
          
          <div style={styles.card} className="glass-panel">
            <div style={styles.cardHeader}>
              <User size={20} color="var(--primary)" />
              <h2 style={styles.cardTitle}>Personal Information</h2>
            </div>
            
            <div style={styles.form}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formGrid3}>
                <div className="form-group">
                  <label className="form-label">Age (years)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    style={styles.select}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Activity Level</label>
                  <select 
                    style={styles.select}
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                  >
                    <option value="sedentary">Sedentary (No Exercise)</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderate Exercise</option>
                    <option value="very_active">Highly Active Athletic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving profile changes...' : 'Save Settings'}
          </button>

        </div>

        {/* Right Column: Dynamic Targets */}
        <div style={styles.rightCol}>
          
          <div style={styles.card} className="glass-panel">
            <div style={styles.cardHeader}>
              <Target size={20} color="var(--primary)" />
              <h2 style={styles.cardTitle}>Daily Baseline Targets</h2>
            </div>

            <div style={styles.form}>
              <div className="form-group">
                <label className="form-label">Hydration Target (glasses of water)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Circadian Sleep Target (hours)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={sleepGoal}
                  onChange={(e) => setSleepGoal(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Activity Steps Target</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 0',
  },
  header: {
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
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
  submitBtn: {
    padding: '14px',
    width: '100%',
  },
};

export default Profile;
