import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Brain, Bot, User, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.name}! I am your Health Plus AI coach. I've audited your latest physical records, hydration state, and circadian recovery patterns. Ask me anything about optimizing your recovery or training!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Fetch today's health metrics to support intelligent contextual recommendations
    const getTodayMetrics = async () => {
      try {
        const res = await axios.get('/api/health/today');
        setTodayLog(res.data);
      } catch (err) {
        console.error('Failed to get context logs for AI', err);
      }
    };
    getTodayMetrics();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputText;
    if (!msg.trim()) return;

    if (!textToSend) setInputText('');

    // Append User Message
    const newUserMsg = { sender: 'user', text: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, newUserMsg]);

    setIsTyping(true);

    // Simulate thinking process
    setTimeout(() => {
      const response = generateSmartResponse(msg);
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: response,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const generateSmartResponse = (query) => {
    const q = query.toLowerCase();
    
    // Core data contexts from today's log
    const cals = todayLog?.nutrition?.totalCalories || 0;
    const calGoal = user?.goals?.calories || 2000;
    const water = todayLog?.hydration?.totalWater || 0;
    const waterGoal = user?.goals?.water || 8;
    const sleep = todayLog?.sleep?.duration || 0;
    const sleepGoal = user?.goals?.sleep || 8;

    // 1. Calories / Diet context
    if (q.includes('calories') || q.includes('eat') || q.includes('diet') || q.includes('nutrition') || q.includes('food')) {
      if (cals === 0) {
        return `I noticed you haven't logged any meals today! For a goal of ${calGoal} kcal, I recommend aiming for a high-protein breakfast to jumpstart your metabolic activity.`;
      }
      const diff = calGoal - cals;
      if (diff > 0) {
        return `You've consumed ${cals} kcal today out of your ${calGoal} kcal target. You have ${diff} kcal remaining. A great snack option here would be greek yogurt with mixed berries or a handful of almonds to hit your micronutrient goals.`;
      } else {
        return `You've exceeded your daily target of ${calGoal} kcal by ${Math.abs(diff)} kcal. Make sure to stay highly hydrated to aid metabolic speed and optimize insulin sensitivity!`;
      }
    }

    // 2. Hydration / Water context
    if (q.includes('water') || q.includes('hydrate') || q.includes('hydration') || q.includes('drink')) {
      if (water < waterGoal) {
        const remaining = waterGoal - water;
        return `You are currently at ${water} glasses of water. You need ${remaining} more glasses to hit your optimal baseline of ${waterGoal}. Dehydration drops performance by up to 15%, so let's grab a glass right now!`;
      }
      return `Outstanding work! You've achieved your full hydration target of ${waterGoal} glasses today. This is crucial for optimal cell volume and rapid recovery.`;
    }

    // 3. Sleep / Circadian recovery context
    if (q.includes('sleep') || q.includes('rest') || q.includes('fatigue') || q.includes('tired') || q.includes('recovery')) {
      if (sleep === 0) {
        return `You haven't logged your sleep duration yet. Ensuring 7-9 hours of consistent, dark-room sleep is the ultimate biohack for muscle protein synthesis and mental clarity.`;
      }
      if (sleep < sleepGoal) {
        return `You logged ${sleep} hours of sleep last night, which is under your target of ${sleepGoal} hours. I suggest minimizing caffeine intake past 2 PM and taking a hot bath 90 minutes before bedtime to induce deep sleep latency.`;
      }
      return `Awesome recovery! You logged ${sleep} hours of high-quality rest. Your physiological markers suggest you are ready for a challenging workout session today!`;
    }

    // 4. Workout / Gym context
    if (q.includes('workout') || q.includes('exercise') || q.includes('training') || q.includes('gym') || q.includes('lift')) {
      return `Consistent training builds structural longevity. Make sure to pair strength exercises with proper daily protein distribution (~1.6g per kg of bodyweight) to support muscle recovery.`;
    }

    // 5. Default contextual summary response
    return `Excellent question. Looking at your daily logs, you've completed ${cals} kcal, ${water} glasses of water, and logged ${sleep} hours of rest. Consistency is key. What specific aspects of nutrition or recovery can we optimize next?`;
  };

  const chips = [
    'Am I drinking enough water?',
    'Optimize my sleep recovery',
    'Tips for muscle building'
  ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Health Coach</h1>
          <p style={styles.subtitle}>Converse with our intelligence engine trained on circadian recovery, athletic nutrition, and daily metabolic profiles.</p>
        </div>
      </header>

      <div style={styles.layout}>
        
        {/* Chat Window */}
        <div style={styles.chatCard} className="glass-panel">
          
          <div style={styles.chatHeader}>
            <div style={styles.botProfile}>
              <div style={styles.botIconWrapper} className="pulse-primary">
                <Brain size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={styles.botName}>Health Plus Engine</div>
                <div style={styles.botStatus}>Online & Ready</div>
              </div>
            </div>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.messageRow,
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {m.sender === 'bot' && (
                  <div style={styles.miniAvatarBot}>
                    <Bot size={16} color="#fff" />
                  </div>
                )}
                <div 
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: m.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px'
                  }}
                >
                  <p style={styles.messageText}>{m.text}</p>
                  <span style={styles.messageTime}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div style={styles.miniAvatarUser}>
                    <User size={16} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={styles.messageRow}>
                <div style={styles.miniAvatarBot}>
                  <Bot size={16} color="#fff" />
                </div>
                <div style={styles.typingBubble}>
                  <div style={styles.typingDot}></div>
                  <div style={styles.typingDot}></div>
                  <div style={styles.typingDot}></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div style={styles.chipsContainer}>
            {chips.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSendMessage(chip)}
                style={styles.chipBtn}
                className="btn-secondary"
              >
                <span>{chip}</span>
                <ArrowRight size={12} />
              </button>
            ))}
          </div>

          {/* Bottom input area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={styles.inputArea}
          >
            <input 
              type="text" 
              placeholder="Ask about steps target, water cups, or rest quality..."
              style={styles.chatInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" style={styles.sendBtn} className="btn-primary">
              <Send size={18} />
            </button>
          </form>

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
  layout: {
    maxWidth: '850px',
    margin: '0 auto',
  },
  chatCard: {
    height: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  botProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  botIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
  },
  botName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
  },
  botStatus: {
    fontSize: '0.75rem',
    color: 'var(--success)',
    fontWeight: '600',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: {
    display: 'flex',
    gap: '10px',
    maxWidth: '80%',
  },
  messageBubble: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  messageText: {
    fontSize: '0.92rem',
    lineHeight: '1.5',
    color: '#fff',
  },
  messageTime: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    alignSelf: 'flex-end',
  },
  miniAvatarBot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  miniAvatarUser: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  typingBubble: {
    padding: '16px 20px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px 18px 18px 2px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--text-secondary)',
    animation: 'pulse 1s infinite alternate',
  },
  chipsContainer: {
    display: 'flex',
    gap: '10px',
    padding: '0 24px 16px 24px',
    overflowX: 'auto',
  },
  chipBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '100px',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  inputArea: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px 24px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  chatInput: {
    flexGrow: 1,
    padding: '14px 18px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'var(--transition)',
  },
  sendBtn: {
    padding: '0 20px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default AICoach;
