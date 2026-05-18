import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Moon, Star, Calendar, Clock, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Sleep = () => {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState(null);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [duration, setDuration] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSleep = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/health/today');
      if (res.data.sleep) {
        setSleepData(res.data.sleep);
        setBedtime(res.data.sleep.bedtime || '');
        setWakeTime(res.data.sleep.wakeTime || '');
        setDuration(res.data.sleep.duration || '');
        setQuality(res.data.sleep.quality || 3);
        setNotes(res.data.sleep.notes || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sleep metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleep();
  }, []);

  const handleSaveSleep = async (e) => {
    e.preventDefault();
    if (!duration) return;

    try {
      const res = await axios.put('/api/health/sleep', {
        bedtime,
        wakeTime,
        duration: parseFloat(duration),
        quality,
        notes
      });
      setSleepData(res.data.sleep);
      toast.success('Sleep logged successfully! Daily streak updated.');
    } catch (err) {
      toast.error('Failed to save sleep log.');
    }
  };

  const sleepGoal = user?.goals?.sleep || 8;
  const sleepPercent = Math.min(100, Math.round(((sleepData?.duration || 0) / sleepGoal) * 100));

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Sleep & Recovery</h1>
          <p style={styles.subtitle}>Log overnight rest duration, rate your circadian sleep quality, and verify recovery scores.</p>
        </div>
        <div style={styles.dateBadge} className="glass-panel">
          <Calendar size={16} />
          <span>Today</span>
        </div>
      </header>

      <div style={styles.grid}>
        
        {/* Left Column: Sleep Score & Log Form */}
        <div style={styles.leftCol}>
          
          {/* Recovery/Sleep Ring Card */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Circadian Recovery Summary</h2>
            <div style={styles.recoveryGrid}>
              
              <div style={styles.gaugeWrapper}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle 
                    cx="70" cy="70" r="54" 
                    stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" 
                  />
                  <circle 
                    cx="70" cy="70" r="54" 
                    stroke="var(--warning)" strokeWidth="10" fill="transparent" 
                    strokeDasharray="339"
                    strokeDashoffset={339 - (339 * sleepPercent) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div style={styles.gaugeText}>
                  <span style={styles.gaugeVal}>{sleepData?.duration || 0}</span>
                  <span style={styles.gaugeUnit}>hours</span>
                </div>
              </div>

              <div style={styles.recoveryDetails}>
                <div style={styles.recoveryGoal}>Goal: {sleepGoal} hrs</div>
                <div style={styles.qualityContainer}>
                  <div style={styles.qualityLabel}>Quality Rating:</div>
                  <div style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={16} 
                        fill={s <= (sleepData?.quality || 0) ? 'var(--warning)' : 'none'} 
                        color="var(--warning)" 
                      />
                    ))}
                  </div>
                </div>
                <p style={styles.recoveryText}>
                  {sleepPercent >= 90 ? 'Fantastic sleep quality! Your central nervous system is fully primed for high exertion today.' : sleepPercent >= 70 ? 'Moderate rest. Keep caffeine levels steady and try to sleep slightly earlier tonight.' : 'Rest deficit detected. Prioritize active recovery and hydrate fully.'}
                </p>
              </div>

            </div>
          </div>

          {/* Sleep Log Form */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Log Last Night's Sleep</h2>
            <form onSubmit={handleSaveSleep} style={styles.form}>
              
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Bedtime</label>
                  <div style={styles.inputContainer}>
                    <Clock size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={styles.input}
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      placeholder="e.g. 10:30 PM"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Wake Time</label>
                  <div style={styles.inputContainer}>
                    <Clock size={16} style={styles.inputIcon} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={styles.input}
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      placeholder="e.g. 6:30 AM"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sleep Duration (hrs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    className="form-input" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sleep Quality (1-5)</label>
                  <select 
                    style={styles.select}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                  >
                    <option value={5}>5 - Superb Rest</option>
                    <option value={4}>4 - Good Sleep</option>
                    <option value={3}>3 - Average Sleep</option>
                    <option value={2}>2 - Interrupted Rest</option>
                    <option value={1}>1 - Bad Restlessness</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sleep Logs / Recovery Notes</label>
                <textarea 
                  className="form-input" 
                  style={styles.textarea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Felt highly rested, woke up once in the middle of the night."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
                <Moon size={18} />
                <span>Save Sleep Log</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Tips & Science facts */}
        <div style={styles.rightCol}>
          
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Circadian Recovery Tips</h2>
            <div style={styles.tipsList}>
              <div style={styles.tipItem}>
                <Sparkles size={18} color="var(--warning)" />
                <div>
                  <h4 style={styles.tipHeading}>Establish consistency</h4>
                  <p style={styles.tipBody}>Try to go to sleep and wake up within the same 30-minute window daily, even on weekends.</p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <Sparkles size={18} color="var(--warning)" />
                <div>
                  <h4 style={styles.tipHeading}>Reduce Blue Light</h4>
                  <p style={styles.tipBody}>Screens emit high frequencies of blue wavelength light. Turn off smartphones and tablets at least 60 minutes before hitting the bed.</p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <Sparkles size={18} color="var(--warning)" />
                <div>
                  <h4 style={styles.tipHeading}>Keep it Cool</h4>
                  <p style={styles.tipBody}>An ambient room temperature of 65-68°F (18-20°C) is ideal for deep, restorative sleep cycles.</p>
                </div>
              </div>
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
    marginBottom: '20px',
  },
  recoveryGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  gaugeWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  gaugeVal: {
    fontSize: '2.25rem',
    fontWeight: '900',
    color: '#fff',
    lineHeight: '1',
  },
  gaugeUnit: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  recoveryDetails: {
    flexGrow: 1,
  },
  recoveryGoal: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--warning)',
  },
  qualityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 0',
  },
  qualityLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  recoveryText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-secondary)',
  },
  input: {
    paddingLeft: '40px',
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
  textarea: {
    resize: 'vertical',
    fontFamily: 'var(--font-sans)',
  },
  submitBtn: {
    padding: '12px',
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  tipItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-md)',
  },
  tipHeading: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
  },
  tipBody: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginTop: '4px',
  },
};

export default Sleep;
