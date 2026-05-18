import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, Filter, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [days, setDays] = useState('7');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/health/logs?days=${days}`);
      setLogs(res.data.reverse());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fitness data metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [days]);

  const chartData = logs.map(l => ({
    date: new Date(l.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
    'Health Score': l.healthScore,
    'Water Intake': l.hydration?.totalWater || 0,
    'Sleep Duration': l.sleep?.duration || 0,
    'Daily Steps': l.steps || 0
  }));

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Advanced Fitness Analytics</h1>
          <p style={styles.subtitle}>Audit multi-dimensional trends of your health score, hydration balance, sleep quality, and workouts volume.</p>
        </div>

        {/* Date Filter selector */}
        <div style={styles.filterWrapper}>
          <Filter size={16} color="var(--text-secondary)" />
          <select 
            style={styles.select} 
            value={days} 
            onChange={(e) => setDays(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </header>

      {chartData.length > 0 ? (
        <div style={styles.chartsGrid}>
          
          {/* Health Score Timeline */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Dynamic Health Score Index</h2>
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: '#121824', borderColor: 'var(--card-border)' }} />
                  <Area type="monotone" dataKey="Health Score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep pattern duration */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Circadian Recovery Sleep Analysis</h2>
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: '#121824', borderColor: 'var(--card-border)' }} />
                  <Line type="monotone" dataKey="Sleep Duration" stroke="var(--warning)" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Water Hydration Intake trend */}
          <div style={styles.card} className="glass-panel">
            <h2 style={styles.cardTitle}>Hydration Balance Trend</h2>
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--info)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: '#121824', borderColor: 'var(--card-border)' }} />
                  <Area type="monotone" dataKey="Water Intake" stroke="var(--info)" strokeWidth={3} fillOpacity={1} fill="url(#waterGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div style={styles.emptyContainer} className="glass-panel">
          <Sparkles size={36} color="var(--text-secondary)" />
          <h3>Insufficient Historical Metrics Data</h3>
          <p>Please continue logs of meals, water intake, sleep recovery, or active workouts to build historical analytics charts.</p>
        </div>
      )}
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
    maxWidth: '800px',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-md)',
    padding: '4px 12px',
  },
  select: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
    padding: '6px 0',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
  },
  chartWrapper: {
    marginTop: '10px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 40px',
    textAlign: 'center',
    gap: '16px',
    color: 'var(--text-secondary)',
  },
};

export default Analytics;
