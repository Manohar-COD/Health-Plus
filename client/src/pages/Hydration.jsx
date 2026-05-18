import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Droplet, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Hydration = () => {
  const { user } = useAuth();
  const [water, setWater] = useState(0);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHydration = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/health/today');
      setWater(res.data.hydration?.totalWater || 0);
      setEntries(res.data.hydration?.entries || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hydration profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHydration();
  }, []);

  const handleAddWater = async (glasses, ml) => {
    try {
      const res = await axios.put('/api/health/water', { glasses, ml });
      setWater(res.data.hydration?.totalWater || 0);
      setEntries(res.data.hydration?.entries || []);
      toast.success(`Logged ${glasses} glass(es) of water!`);
    } catch (err) {
      toast.error('Failed to log water entry.');
    }
  };

  const waterGoal = user?.goals?.water || 8;
  const waterPercent = Math.min(100, Math.round((water / waterGoal) * 100));

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Hydration Tracker</h1>
          <p style={styles.subtitle}>Stay optimized! Keep track of daily fluids to boost focus, performance, and recovery.</p>
        </div>
        <div style={styles.dateBadge} className="glass-panel">
          <Calendar size={16} />
          <span>Today</span>
        </div>
      </header>

      <div style={styles.grid}>
        
        {/* Left Side: Water Wave Liquid Widget */}
        <div style={styles.leftCol}>
          
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Fluid Balance</h2>
            
            <div style={styles.liquidWrapper}>
              
              {/* Glass / Thermometer with Animated wave */}
              <div style={styles.glassContainer}>
                <div style={{ ...styles.waterLevel, height: `${waterPercent}%` }}>
                  {/* Wave styling effects inside the cylinder */}
                  <div style={styles.waveEffect}></div>
                </div>
                <div style={styles.glassLabelContainer}>
                  <span style={styles.glassPercent}>{waterPercent}%</span>
                  <span style={styles.glassProgress}>{water} / {waterGoal} glasses</span>
                </div>
              </div>

              <div style={styles.liquidInfo}>
                <div style={styles.volumeTitle}>{(water * 250 / 1000).toFixed(2)} L</div>
                <div style={styles.volumeSub}>Total Volume Drunk</div>
                <p style={styles.volumeDesc}>
                  Your current customized daily target is <b>{waterGoal} glasses</b> ({waterGoal * 250 / 1000}L).
                </p>
                {waterPercent >= 100 && (
                  <div style={styles.goalMetBadge}>
                    <Sparkles size={16} />
                    <span>Daily Goal Accomplished!</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Quick Intake Actions */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Quick Hydration Log</h2>
            <div style={styles.quickActionsGrid}>
              
              <button 
                onClick={() => handleAddWater(1, 250)}
                style={{ ...styles.actionCard, borderLeft: '4px solid var(--info)' }}
                className="sidebar-link"
              >
                <div style={styles.actionIconWrapper}>
                  <Droplet size={20} color="var(--info)" />
                </div>
                <div style={styles.actionDetails}>
                  <div style={styles.actionTitle}>1 Glass</div>
                  <div style={styles.actionSub}>250 ml</div>
                </div>
              </button>

              <button 
                onClick={() => handleAddWater(2, 500)}
                style={{ ...styles.actionCard, borderLeft: '4px solid #3b82f6' }}
                className="sidebar-link"
              >
                <div style={styles.actionIconWrapper}>
                  <Droplet size={24} color="#3b82f6" />
                </div>
                <div style={styles.actionDetails}>
                  <div style={styles.actionTitle}>1 Bottle</div>
                  <div style={styles.actionSub}>500 ml</div>
                </div>
              </button>

              <button 
                onClick={() => handleAddWater(4, 1000)}
                style={{ ...styles.actionCard, borderLeft: '4px solid #1d4ed8' }}
                className="sidebar-link"
              >
                <div style={styles.actionIconWrapper}>
                  <Droplet size={28} color="#1d4ed8" />
                </div>
                <div style={styles.actionDetails}>
                  <div style={styles.actionTitle}>Large Carafe</div>
                  <div style={styles.actionSub}>1000 ml</div>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Right Side: Hydration Log entries */}
        <div style={styles.rightCol}>
          
          <div style={{ ...styles.card, minHeight: '100%' }} className="glass-panel">
            <h2 style={styles.cardTitle}>Water Log Entries</h2>
            
            <div style={styles.entriesList}>
              {entries.map((entry, idx) => (
                <div key={entry._id || idx} style={styles.entryItem}>
                  <div style={styles.entryLeft}>
                    <div style={styles.entryIconWrapper}>
                      <Droplet size={18} color="var(--info)" />
                    </div>
                    <div style={styles.entryInfo}>
                      <div style={styles.entryAmount}>{entry.amount} ml</div>
                      <div style={styles.entryTime}>
                        {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={styles.entryGlasses}>+{entry.amount / 250} glass</div>
                </div>
              ))}

              {entries.length === 0 && (
                <div style={styles.emptyEntries}>
                  <Droplet size={36} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                  <h3>No Intake Logged Today</h3>
                  <p>Drink a glass of water and hit any of the log buttons to start tracking!</p>
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
    marginBottom: '20px',
  },
  liquidWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    padding: '10px 0',
  },
  glassContainer: {
    width: '130px',
    height: '240px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'transparent',
    borderRadius: '0 0 20px 20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  waterLevel: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(6, 182, 212, 0.4)',
    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'flex-start',
  },
  waveEffect: {
    width: '200%',
    height: '20px',
    borderRadius: '40%',
    backgroundColor: 'rgba(6, 182, 212, 0.5)',
    position: 'absolute',
    top: '-10px',
    left: '-50%',
    animation: 'spin 6s linear infinite',
  },
  glassLabelContainer: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  glassPercent: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  glassProgress: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  liquidInfo: {
    flexGrow: 1,
  },
  volumeTitle: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#fff',
  },
  volumeSub: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  volumeDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginTop: '16px',
  },
  goalMetBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '100px',
    backgroundColor: 'var(--success-glow)',
    color: 'var(--success)',
    fontWeight: '600',
    fontSize: '0.85rem',
    width: 'fit-content',
    marginTop: '16px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  actionIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
  },
  actionSub: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  entriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
  },
  entryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  entryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  entryIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--info-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  entryAmount: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
  },
  entryTime: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  entryGlasses: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--info)',
  },
  emptyEntries: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text-secondary)',
    gap: '12px',
  },
};

export default Hydration;
