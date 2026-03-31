import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Cpu, Brain, Eye, MessageSquare, Database, Zap,
  Activity, Settings, History, Layers, BarChart3,
  Heart, Target, Globe, Mic, Image,
  Sparkles, Shield, Home, Search, User, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, Info, Lightbulb
} from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8001';

const AGENTS = [
  { id: 'reasoning', name: 'Reasoning Agent', desc: 'Strategy & decisions', icon: Brain, color: 'reasoning' },
  { id: 'vision', name: 'Vision Agent', desc: 'Visual understanding', icon: Eye, color: 'vision' },
  { id: 'nlp', name: 'NLP Agent', desc: 'Language processing', icon: MessageSquare, color: 'nlp' },
  { id: 'knowledge', name: 'Knowledge Agent', desc: 'RAG & domain facts', icon: Database, color: 'knowledge' },
  { id: 'action', name: 'Action Agent', desc: 'Task execution', icon: Zap, color: 'action' },
];

const AGENT_ICONS_MAP = {
  "Reasoning Agent": Brain,
  "Vision Agent": Eye,
  "NLP Agent": MessageSquare,
  "Knowledge Agent": Database,
  "Action Agent": Zap,
};

const QUICK_PROMPTS = [
  { text: "I'm confused about buying a house", icon: Home },
  { text: "Analyze cybersecurity threats for my startup", icon: Shield },
  { text: "Help me understand my health report", icon: Heart },
  { text: "What's the latest in AI research?", icon: Sparkles },
];

const DOMAINS = ['General', 'Health', 'Real Estate', 'Tech', 'Disaster', 'Finance', 'Cybersecurity'];

const EMOTION_CONFIG = {
  Confidence: { color: 'hsl(142 71% 45%)', icon: CheckCircle },
  Neutral:    { color: 'hsl(199 89% 48%)', icon: Info },
  Confusion:  { color: 'hsl(38 92% 50%)', icon: Lightbulb },
  Panic:      { color: 'hsl(0 84% 60%)', icon: AlertTriangle },
};

/* ═══════════════════════════════════════
   SWARM NETWORK VISUALIZATION
   ═══════════════════════════════════════ */
function SwarmVisualization({ activeAgents, isThinking }) {
  const nodes = [
    { id: 'reasoning', x: 58, y: 28 },
    { id: 'vision',    x: 218, y: 28 },
    { id: 'nlp',       x: 35,  y: 130 },
    { id: 'knowledge', x: 240, y: 130 },
    { id: 'action',    x: 138, y: 148 },
  ];
  const center = { x: 138, y: 80 };

  const isActive = (id) => activeAgents.some(a => a.toLowerCase().includes(id.toLowerCase()));
  const agentIconMap = { reasoning: Brain, vision: Eye, nlp: MessageSquare, knowledge: Database, action: Zap };

  return (
    <div className="swarm-network">
      {isThinking && (
        <div className="swarm-thinking-ring" />
      )}
      <svg>
        {nodes.map(node => (
          <line
            key={node.id}
            x1={center.x} y1={center.y}
            x2={node.x + 18} y2={node.y + 18}
            className={isActive(node.id) ? 'active' : ''}
          />
        ))}
      </svg>
      <div className="swarm-node center">
        <motion.div animate={isThinking ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
          <Cpu size={20} color="white" />
        </motion.div>
      </div>
      {nodes.map(node => {
        const Icon = agentIconMap[node.id];
        const active = isActive(node.id);
        return (
          <motion.div
            key={node.id}
            className={`swarm-node ${active ? 'active' : ''}`}
            style={{ left: node.x, top: node.y }}
            animate={active && isThinking ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, delay: Math.random() * 0.5 }}
          >
            <Icon size={14} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   EMOTION BARS 
   ═══════════════════════════════════════ */
function EmotionBars({ currentEmotion }) {
  const emotions = [
    { name: 'Confidence', key: 'confidence', base: 20 },
    { name: 'Neutral',    key: 'neutral',    base: 55 },
    { name: 'Confusion',  key: 'confusion',  base: 15 },
    { name: 'Panic',      key: 'panic',      base: 10 },
  ];
  return (
    <div className="emotion-visual">
      {emotions.map(em => {
        const active = currentEmotion?.toLowerCase() === em.name.toLowerCase();
        const value = active ? 88 : em.base;
        return (
          <div key={em.key} className="emotion-bar-row">
            <span className="emotion-bar-label" style={{ color: active ? EMOTION_CONFIG[em.name]?.color : undefined }}>
              {em.name}
            </span>
            <div className="emotion-bar-track">
              <motion.div
                className={`emotion-bar-fill ${em.key}`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="emotion-bar-value">{value}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   AGENT INSIGHTS ACCORDION
   ═══════════════════════════════════════ */
function AgentInsights({ insights }) {
  const [open, setOpen] = useState(false);
  if (!insights || Object.keys(insights).length === 0) return null;

  return (
    <div className="agent-insights-accordion">
      <button className="insights-toggle" onClick={() => setOpen(!open)}>
        <Layers size={12} />
        <span>Agent Reasoning ({Object.keys(insights).length} agents)</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="insights-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {Object.entries(insights).map(([agentName, insight]) => {
              const Icon = AGENT_ICONS_MAP[agentName] || Activity;
              return (
                <div key={agentName} className="insight-row">
                  <div className="insight-agent-badge">
                    <Icon size={11} />
                    <span>{agentName}</span>
                  </div>
                  <p className="insight-text">{insight}</p>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════
   SETTINGS & ACCOUNT VIEW
   ═══════════════════════════════════════ */
function SettingsView({ backendOnline }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="view-panel settings">
      <h2>Platform Settings</h2>
      <div className="settings-grid">
        <div className="settings-card">
          <h4>Swarm Configuration</h4>
          <div className="setting-row">
            <span>Model Endpoint</span>
            <span className="mono">http://localhost:8001</span>
          </div>
          <div className="setting-row">
            <span>LLM Backbone</span>
            <span className="badge secondary">tinyllama (Ollama)</span>
          </div>
          <div className="setting-row">
            <span>Response Mode</span>
            <select className="setting-select">
              <option>Fast Swarm (Single Pass)</option>
              <option>Sequential (Precise)</option>
            </select>
          </div>
          <div className="setting-row">
            <span>Swarm RAG Memory</span>
            <div className="toggle active">ON</div>
          </div>
        </div>

        <div className="settings-card">
          <h4>Interface</h4>
          <div className="setting-row">
            <span>Theme</span>
            <span className="badge primary">Glassmorphic Dark</span>
          </div>
          <div className="setting-row">
            <span>Animations</span>
            <div className="toggle active">Framer-Motion Enabled</div>
          </div>
          <div className="setting-row">
            <span>Auto-Scroll</span>
            <div className="toggle active">ON</div>
          </div>
        </div>

        <div className="settings-card danger">
          <h4>System Health</h4>
          <div className="setting-row">
            <span>Backend API</span>
            <span className={`status ${backendOnline ? 'online' : 'offline'}`}>
              ● {backendOnline ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <button className="danger-btn" onClick={handleClearHistory}>Clear All Chat History</button>
        </div>
      </div>
    </motion.div>
  );
}

function AccountView({ messages }) {
  const agentUsage = messages.reduce((acc, msg) => {
    msg.active_agents?.forEach(a => acc[a] = (acc[a] || 0) + 1);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="view-panel account">
      <h2>Agent Intelligence Profile</h2>
      <div className="account-summary">
        <div className="profile-header">
          <div className="profile-avatar"><User size={40} /></div>
          <div className="profile-info">
            <h3>Enterprise User</h3>
            <p>Session Active · {messages.length} interactions</p>
          </div>
        </div>

        <div className="usage-stats">
          <h4>Swarm Utilization Stats</h4>
          <div className="stats-grid">
            {AGENTS.map(a => (
              <div key={a.id} className="stat-card">
                <span className="stat-label">{a.name}</span>
                <span className="stat-value">{agentUsage[a.name] || 0}</span>
                <span className="stat-sub">invocations</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryView({ messages, history, onRestore }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="view-panel history">
      <h2>Recent Chats Store</h2>
      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">Your swarm archives are empty.</div>
        ) : (
          history.map((session, i) => (
            <div key={i} className="history-item settings-card">
              <div className="history-header">
                <span className="badge secondary">Session {history.length - i}</span>
                <span className="mono" style={{fontSize: '0.7rem'}}>{session.date}</span>
              </div>
              <p className="history-snippet">"{session.snippet}"</p>
              <div className="history-actions">
                <button className="mini-btn success" onClick={() => onRestore(session.messages)}>Restore Swarm</button>
              </div>
            </div>
          )).reverse()
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [messages, setMessages] = useState([]); // ALWAYS START EMPTY
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('omniswarm_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [status, setStatus] = useState({
    intent: 'Awaiting',
    emotion: 'Neutral',
    domain: 'General',
    active_agents: [],
  });
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text: 'System initialized. Swarm agents on standby.' },
  ]);

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const chatRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(() => { setBackendOnline(true); addLog('✓ Backend connected successfully.'); })
      .catch(() => { setBackendOnline(false); addLog('⚠ Backend offline. Check server on port 8002.'); });
  }, []);

  // Save History to LocalStorage
  useEffect(() => {
    localStorage.setItem('omniswarm_history', JSON.stringify(history));
  }, [history]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to purge all archives?')) {
      setHistory([]);
      localStorage.removeItem('omniswarm_history');
      addLog('✦ Swarm history archives purged.');
    }
  };

  const archiveCurrentSession = () => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Untitled Session';
    const newSession = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      snippet: firstUserMsg.slice(0, 80) + (firstUserMsg.length > 80 ? '...' : ''),
      messages: [...messages]
    };
    setHistory(prev => [...prev, newSession]);
  };

  const handleNewChat = () => {
    archiveCurrentSession();
    setMessages([]);
    setStatus({ intent: 'Awaiting', emotion: 'Neutral', domain: 'General', active_agents: [] });
    addLog('✦ Context archived. Starting fresh session.');
  };

  const handleRestore = (restoredMessages) => {
    setMessages(restoredMessages);
    setActiveTab('chat');
    addLog('✦ Session restored from archive.');
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  const addLog = (text) => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text },
      ...prev.slice(0, 14),
    ]);
  };

  const handleSend = async (overrideInput) => {
    const msg = overrideInput || input;
    if (!msg.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);
    addLog(`⟶ Query: "${msg.slice(0, 45)}${msg.length > 45 ? '...' : ''}"`);

    try {
      addLog('→ Meta Controller: analyzing intent & emotion...');
      const response = await axios.post(`${API_URL}/chat`, {
        user_id: 'user_' + Date.now(),
        message: msg,
        history: messages.slice(-6),
      });

      const data = response.data;
      addLog(`✓ Intent: ${data.intent} | Emotion: ${data.emotion} | Domain: ${data.domain}`);
      addLog(`→ Agents: ${data.active_agents.join(', ')}`);
      addLog(`✓ Swarm synthesis complete (${data.metadata?.source || 'llm'})`);

      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response,
        active_agents: data.active_agents,
        agent_insights: data.agent_insights || {},
        intent: data.intent,
        emotion: data.emotion,
        domain: data.domain,
        source: data.metadata?.source,
      }]);

      setStatus({
        intent: data.intent,
        emotion: data.emotion,
        domain: data.domain,
        active_agents: data.active_agents,
      });

    } catch (error) {
      addLog('✗ Backend connection failed. Is the server running?');
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '**Connection Error**\n\nUnable to reach the OmniSwarm backend on port 8001. Please ensure the server is running:\n\n```\ncd backend\nuvicorn main:app --port 8001\n```',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const EmotionIcon = EMOTION_CONFIG[status.emotion]?.icon || Info;
  const hasMessages = messages.length > 0;

  return (
    <div className="omniswarm-app">

      {/* ══════ ICON SIDEBAR ══════ */}
      <div className="icon-sidebar">
        <div className="sidebar-logo" onClick={handleNewChat}><Cpu size={22} color="white" /></div>
        <button className={`sidebar-icon-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} title="Chat"><MessageSquare size={20} /></button>
        <button className={`sidebar-icon-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')} title="Search"><Search size={20} /></button>
        <button className={`sidebar-icon-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} title="History"><History size={20} /></button>
        <button className={`sidebar-icon-btn ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')} title="Agents"><Layers size={20} /></button>
        <button className={`sidebar-icon-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} title="Analytics"><BarChart3 size={20} /></button>
        <div className="sidebar-spacer" />
        <button className={`sidebar-icon-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="Settings"><Settings size={20} /></button>
        <button className={`sidebar-icon-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')} title="Profile"><User size={20} /></button>
      </div>

      {/* ══════ AGENTS SIDEBAR ══════ */}
      <div className="agents-sidebar">
        <div className="agents-sidebar-header">
          <h3>Swarm Network</h3>
          <h2>AI Agents</h2>
        </div>
        <div className="agents-list">
          {AGENTS.map(agent => {
            const Icon = agent.icon;
            const isActive = status.active_agents.some(a =>
              a.toLowerCase().includes(agent.id.toLowerCase())
            );
            return (
              <motion.div
                key={agent.id}
                className={`agent-card ${isActive ? 'active' : ''}`}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`agent-icon-wrapper ${agent.color}`}><Icon size={18} /></div>
                <div className="agent-info">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-desc">{agent.desc}</div>
                </div>
                <div className={`agent-status-dot ${isActive && isLoading ? 'thinking' : isActive ? 'active' : 'idle'}`} />
              </motion.div>
            );
          })}
        </div>

        <div className="system-status">
          <div className="status-row">
            <span className="status-label">Backend</span>
            <span className={`status-value ${backendOnline ? 'online' : 'offline'}`}>
              {backendOnline ? '● Online' : '○ Offline'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Swarm</span>
            <span className={`status-value ${isLoading ? 'processing' : 'online'}`}>
              {isLoading ? '⟳ Processing' : '● Ready'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Active</span>
            <span className="status-value online">{status.active_agents.length} / 5</span>
          </div>
          <div className="status-row">
            <span className="status-label">Emotion</span>
            <span className="status-value" style={{ color: EMOTION_CONFIG[status.emotion]?.color || 'white' }}>
              {status.emotion}
            </span>
          </div>
        </div>
      </div>

      {/* ══════ MAIN CHAT ══════ */}
      <div className="main-chat-area">
        <div className="top-bar">
          <div className="top-bar-title">
            <h1>OmniSwarm Intelligence</h1>
            <span className="session-badge">v2.0 · {backendOnline ? 'Live' : 'Offline'}</span>
          </div>
          <div className="top-bar-actions">
            <button className="top-action-btn" title="New Chat" onClick={handleNewChat}><Sparkles size={16} /></button>
            <button className="top-action-btn" title="Analytics" onClick={() => setActiveTab('analytics')}><BarChart3 size={16} /></button>
            <button className="top-action-btn" title="Settings" onClick={() => setActiveTab('settings')}><Settings size={16} /></button>
          </div>
        </div>

        <div className="chat-messages" ref={chatRef}>
          {activeTab === 'settings' && <SettingsView backendOnline={backendOnline} handleClearHistory={handleClearHistory} />}
          {activeTab === 'account' && <AccountView messages={messages} />}
          {activeTab === 'history' && <HistoryView history={history} onRestore={handleRestore} />}
          
          {(activeTab === 'chat' || activeTab === 'search') && (
            <>
          {activeTab === 'search' && (
            <div className="search-overlay">
              <input 
                autoFocus
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="close-search" onClick={() => { setActiveTab('chat'); setSearchQuery(''); }}>✕</button>
            </div>
          )}

          {!hasMessages && (
            <div className="welcome-screen">
              <motion.div className="welcome-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                <Cpu size={36} color="white" />
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                OmniSwarm AI
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                A real-time multi-agent intelligence platform. Specialized agents collaborate to deliver
                domain-precise, emotion-aware, and actionable responses to any query.
              </motion.p>
              <motion.div className="quick-prompts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {QUICK_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button key={i} className="quick-prompt" onClick={() => handleSend(prompt.text)}>
                      <div className="quick-prompt-icon"><Icon size={16} /></div>
                      {prompt.text}
                    </button>
                  );
                })}
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).map((msg, idx) => (
              <motion.div
                key={idx}
                className={`message-group ${msg.role}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                  {msg.role === 'user' ? <User size={16} color="white" /> : <Cpu size={16} color="white" />}
                </div>
                <div className="message-content">
                  <span className="message-sender">{msg.role === 'user' ? 'You' : 'OmniSwarm'}</span>

                  <div className="message-bubble">
                    {msg.role === 'ai' ? (
                      <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>

                  {msg.role === 'ai' && (msg.intent || msg.emotion || msg.domain) && (
                    <div className="message-meta">
                      {msg.emotion && (
                        <span className="meta-tag emotion">
                          <Heart size={10} /> {msg.emotion}
                        </span>
                      )}
                      {msg.intent && (
                        <span className="meta-tag intent">
                          <Target size={10} /> {msg.intent}
                        </span>
                      )}
                      {msg.domain && (
                        <span className="meta-tag domain">
                          <Globe size={10} /> {msg.domain}
                        </span>
                      )}
                      {msg.source && (
                        <span className="meta-tag source">
                          <Cpu size={10} /> {msg.source === 'llm_synthesis' ? 'AI Synthesis' : msg.source === 'template' ? 'Knowledge Base' : msg.source}
                        </span>
                      )}
                    </div>
                  )}

                  {msg.role === 'ai' && msg.active_agents && (
                    <div className="message-agents">
                      {msg.active_agents.map(agent => {
                        const Icon = AGENT_ICONS_MAP[agent] || Activity;
                        return (
                          <span key={agent} className="mini-agent-chip">
                            <Icon size={10} /> {agent}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {msg.role === 'ai' && msg.agent_insights && (
                    <AgentInsights insights={msg.agent_insights} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div className="typing-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="message-avatar ai-avatar"><Cpu size={16} color="white" /></div>
              <div>
                <div className="typing-dots"><span /><span /><span /></div>
                <div className="typing-label">Swarm reasoning in progress...</div>
              </div>
            </motion.div>
          )}
          </>
          )}
        </div>

        {(activeTab === 'chat' || activeTab === 'search') && (
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              type="text"
              placeholder="Ask the swarm anything — health, finance, tech, disaster..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="input-action-btn" title="Voice"><Mic size={16} /></button>
            <button className="input-action-btn" title="Image"><Image size={16} /></button>
            <button className="send-btn" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
          <div className="input-hint">
            <span>Press <kbd>Enter</kbd> to activate swarm</span>
            <span>OmniSwarm v2.0 · {status.domain} domain active</span>
          </div>
        </div>
        )}
      </div>

      {/* ══════ INTELLIGENCE PANEL ══════ */}
      <div className="intel-panel">
        <div className="intel-panel-header">
          <h3>Real-Time Analysis</h3>
          <h2>Intelligence Feed</h2>
        </div>

        <div className="swarm-viz">
          <div className="intel-section-title"><Layers size={12} /> Swarm Network</div>
          <SwarmVisualization activeAgents={status.active_agents} isThinking={isLoading} />
        </div>

        <div className="intel-section">
          <div className="intel-section-title"><Heart size={12} /> Emotion Analysis</div>
          <div className="intel-card">
            <EmotionBars currentEmotion={status.emotion} />
          </div>
        </div>

        <div className="intel-section">
          <div className="intel-section-title"><Target size={12} /> Current Context</div>
          <div className="intel-card">
            <div className="intel-metric">
              <span className="intel-metric-label">Session Timer</span>
              <span className="intel-metric-value" style={{ color: 'var(--success)' }}>{formatTime(sessionTime)}</span>
            </div>
            <div className="intel-metric">
              <span className="intel-metric-label">Intent</span>
              <span className="intel-metric-value" style={{ color: 'hsl(199 89% 65%)' }}>{status.intent}</span>
            </div>
            <div className="intel-metric">
              <span className="intel-metric-label">Emotion</span>
              <span className="intel-metric-value" style={{ color: EMOTION_CONFIG[status.emotion]?.color || 'white' }}>{status.emotion}</span>
            </div>
            <div className="intel-metric">
              <span className="intel-metric-label">Domain</span>
              <span className="intel-metric-value" style={{ color: 'hsl(142 71% 60%)' }}>{status.domain}</span>
            </div>
          </div>
        </div>

        <div className="intel-section">
          <div className="intel-section-title"><Globe size={12} /> Domain Detection</div>
          <div className="domain-chips">
            {DOMAINS.map(d => (
              <span key={d} className={`domain-chip ${status.domain === d ? 'active' : ''}`}>{d}</span>
            ))}
          </div>
        </div>

        <div className="activity-log">
          <div className="intel-section-title"><Activity size={12} /> Activity Log</div>
          <div className="log-entries">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i + log.time}
                  className="log-entry"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="log-time">{log.time}</span>
                  <span className="log-text">{log.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="platform-branding-footer">
        <span>Developed with ⚡ by </span>
        <span className="founder-name">123sajid</span>
      </div>
    </div>
  );
}

export default App;
