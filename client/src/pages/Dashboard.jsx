import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Flame, Droplet, Moon, Sparkles, Plus, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick inputs
  const [quickSteps, setQuickSteps] = useState('');
  const [quickWater, setQuickWater] = useState(1);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, logsRes, insightsRes] = await Promise.all([
        axios.get('/api/health/today'),
        axios.get('/api/health/logs?days=7'),
        axios.get('/api/health/insights')
      ]);
      setTodayLog(todayRes.data);
      setWeeklyLogs(logsRes.data.reverse());
      setInsights(insightsRes.data.insights);
    } catch (err) {
      console.error('Error loading dashboard data', err);
      toast.error('Failed to fetch daily dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddWater = async () => {
    try {
      const res = await axios.put('/api/health/water', { glasses: quickWater, ml: quickWater * 250 });
      setTodayLog(res.data);
      toast.success(`Logged ${quickWater} glass(es) of water!`);
      // Update charts & insights
      const [logsRes, insightsRes] = await Promise.all([
        axios.get('/api/health/logs?days=7'),
        axios.get('/api/health/insights')
      ]);
      setWeeklyLogs(logsRes.data.reverse());
      setInsights(insightsRes.data.insights);
    } catch (err) {
      toast.error('Failed to add water.');
    }
  };

  const handleUpdateSteps = async (e) => {
    e.preventDefault();
    if (!quickSteps) return;
    try {
      const res = await axios.put('/api/health/steps', { steps: parseInt(quickSteps) });
      setTodayLog(res.data);
      setQuickSteps('');
      toast.success('Steps updated successfully!');
      // Update charts & insights
      const [logsRes, insightsRes] = await Promise.all([
        axios.get('/api/health/logs?days=7'),
        axios.get('/api/health/insights')
      ]);
      setWeeklyLogs(logsRes.data.reverse());
      setInsights(insightsRes.data.insights);
    } catch (err) {
      toast.error('Failed to update steps.');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} className="pulse-primary"></div>
      </div>
    );
  }

  const water = todayLog?.hydration?.totalWater || 0;
  const waterGoal = user?.goals?.water || 8;
  const waterPercent = Math.min(100, Math.round((water / waterGoal) * 100));

  const sleep = todayLog?.sleep?.duration || 0;
  const sleepGoal = user?.goals?.sleep || 8;
  const sleepPercent = Math.min(100, Math.round((sleep / sleepGoal) * 100));

  const steps = todayLog?.steps || 0;
  const stepsGoal = user?.goals?.steps || 10000;
  const stepsPercent = Math.min(100, Math.round((steps / stepsGoal) * 100));

  const score = todayLog?.healthScore || 50;

  // Chart data format
  const chartData = weeklyLogs.map(l => ({
    date: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' }),
    'Health Score': l.healthScore,
    'Water': l.hydration?.totalWater || 0,
    'Sleep': l.sleep?.duration || 0
  }));

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Top Welcome Bar */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeText}>Welcome back, {user?.name}!</h1>
          <p style={styles.subtext}>Here's your real-time health profile overview for today.</p>
        </div>
        <div style={styles.streakBadge} className="glass-panel">
          <Flame size={20} color="var(--warning)" />
          <span>{user?.streak || 0} Day Streak</span>
        </div>
      </header>

      {/* Grid Layout */}
      <div style={styles.dashboardGrid}>
        
        {/* Left Side: Score & Core Insights */}
        <div style={styles.leftCol}>
          
          {/* Health Score Panel */}
          <div style={{ ...styles.card, ...styles.scoreCard }} className="glass-panel">
            <div style={styles.scoreDetails}>
              <h2 style={styles.cardTitle}>Daily Health Score</h2>
              <p style={styles.scoreDesc}>
                Calculated dynamically based on your calorie balance, hydration, rest, steps, and overall mood levels.
              </p>
              <div style={styles.scoreRating}>
                <span style={{ 
                  color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' 
                }}>
                  {score >= 80 ? 'Excellent Condition' : score >= 60 ? 'Moderate Condition' : 'Needs Optimization'}
                </span>
              </div>
            </div>
            
            <div style={styles.ringContainer}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle 
                  cx="75" cy="75" r="60" 
                  stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" 
                />
                <circle 
                  cx="75" cy="75" r="60" 
                  stroke="var(--primary)" strokeWidth="12" fill="transparent" 
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * score) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div style={styles.ringText}>
                <span style={styles.scoreNumber}>{score}</span>
                <span style={styles.scoreLabel}>pts</span>
              </div>
            </div>
          </div>

          {/* Quick Logs Widget */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Quick Metrics Log</h2>
            <div style={styles.quickLogGrid}>
              {/* Add Water */}
              <div style={styles.quickLogBlock}>
                <div style={styles.quickLogHeader}>
                  <Droplet size={18} color="var(--info)" />
                  <span style={styles.quickLogTitle}>Hydration Entry</span>
                </div>
                <div style={styles.quickInputRow}>
                  <select 
                    style={styles.select}
                    value={quickWater}
                    onChange={(e) => setQuickWater(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Glass (250ml)</option>
                    <option value={2}>2 Glasses (500ml)</option>
                    <option value={4}>4 Glasses (1L)</option>
                  </select>
                  <button onClick={handleAddWater} style={styles.addButton} className="btn-primary">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add Steps */}
              <form onSubmit={handleUpdateSteps} style={styles.quickLogBlock}>
                <div style={styles.quickLogHeader}>
                  <Activity size={18} color="var(--success)" />
                  <span style={styles.quickLogTitle}>Step Tracker</span>
                </div>
                <div style={styles.quickInputRow}>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000"
                    style={styles.miniInput}
                    value={quickSteps}
                    onChange={(e) => setQuickSteps(e.target.value)}
                    required
                  />
                  <button type="submit" style={styles.addButton} className="btn-primary">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Smart Insights */}
          <div style={styles.card} className="glass-panel">
            <div style={styles.insightsHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h2 style={styles.cardTitle}>AI Coach Insights</h2>
              </div>
              <span style={styles.insightsBadge}>Real-time analysis</span>
            </div>

            <div style={styles.insightsList}>
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  style={{
                    ...styles.insightItem,
                    borderLeftColor: insight.type === 'success' ? 'var(--success)' : insight.type === 'warning' ? 'var(--warning)' : 'var(--danger)'
                  }}
                >
                  <span style={styles.insightIcon}>{insight.icon}</span>
                  <div style={styles.insightContent}>
                    <h4 style={styles.insightTitle}>{insight.title}</h4>
                    <p style={styles.insightText}>{insight.message}</p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <div style={styles.emptyInsights}>
                  <AlertCircle size={24} color="var(--text-secondary)" />
                  <p>Log a meal or sleep duration to generate intelligent AI recommendations.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Quick Stats & Weekly Charts */}
        <div style={styles.rightCol}>
          
          {/* Daily Circular Ring Metrics Grid */}
          <div style={styles.statsGrid}>
            
            {/* Hydration progress */}
            <div style={styles.statCard} className="glass-panel">
              <div style={styles.statIconWrapper}><Droplet size={20} color="var(--info)" /></div>
              <div style={styles.statDetails}>
                <div style={styles.statValue}>{water} <span style={styles.statUnit}>/ {waterGoal} glasses</span></div>
                <div style={styles.statLabel}>Hydration Intake</div>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBar, width: `${waterPercent}%`, backgroundColor: 'var(--info)' }}></div>
              </div>
            </div>

            {/* Sleep Progress */}
            <div style={styles.statCard} className="glass-panel">
              <div style={styles.statIconWrapper}><Moon size={20} color="var(--warning)" /></div>
              <div style={styles.statDetails}>
                <div style={styles.statValue}>{sleep} <span style={styles.statUnit}>/ {sleepGoal} hrs</span></div>
                <div style={styles.statLabel}>Rest Cycles</div>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBar, width: `${sleepPercent}%`, backgroundColor: 'var(--warning)' }}></div>
              </div>
            </div>

            {/* Step Progress */}
            <div style={styles.statCard} className="glass-panel">
              <div style={styles.statIconWrapper}><Activity size={20} color="var(--success)" /></div>
              <div style={styles.statDetails}>
                <div style={styles.statValue}>{steps} <span style={styles.statUnit}>/ {stepsGoal} steps</span></div>
                <div style={styles.statLabel}>Activity Quotient</div>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBar, width: `${stepsPercent}%`, backgroundColor: 'var(--success)' }}></div>
              </div>
            </div>

          </div>

          {/* Area Performance Chart */}
          <div style={{ ...styles.card, flexGrow: 1 }} className="glass-panel">
            <h2 style={styles.cardTitle}>Dynamic Weekly Fitness Performance</h2>
            <div style={styles.chartWrapper}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ background: '#121824', borderColor: 'var(--card-border)' }} />
                    <Area 
                      type="monotone" 
                      dataKey="Health Score" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#scoreColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.emptyChart}>
                  <p>Not enough logs to generate weekly analytics chart. Keep logging!</p>
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
  welcomeText: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
  },
  subtext: {
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '100px',
    fontWeight: '600',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '430px 1fr',
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
    gap: '24px',
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
  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  scoreDetails: {
    flexGrow: 1,
  },
  scoreDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '12px',
  },
  scoreRating: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  ringContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1',
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  statCard: {
    padding: '20px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
  },
  statUnit: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '400',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '100px',
    transition: 'width 0.5s ease-in-out',
  },
  quickLogGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  quickLogBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickLogHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quickLogTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  quickInputRow: {
    display: 'flex',
    gap: '10px',
  },
  select: {
    flexGrow: 1,
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  miniInput: {
    flexGrow: 1,
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  addButton: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  insightsBadge: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: '600',
    backgroundColor: 'var(--primary-glow)',
    padding: '4px 8px',
    borderRadius: '100px',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderLeft: '4px solid transparent',
  },
  insightIcon: {
    fontSize: '1.25rem',
  },
  insightContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  insightTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  insightText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.4',
  },
  emptyInsights: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    padding: '24px',
    color: 'var(--text-secondary)',
  },
  chartWrapper: {
    marginTop: '16px',
  },
  emptyChart: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
  },
  loading: {
    height: 'calc(100vh - 40px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.05)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Dashboard;
