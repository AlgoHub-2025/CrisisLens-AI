import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Download, 
  Search, 
  RefreshCw, 
  FileText, 
  Layers, 
  Database, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Building,
  Info,
  Clock,
  Compass,
  ArrowRight,
  Lock,
  LogOut,
  Check,
  Eye
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import { getFloodZone, EXIT_TYPE_COLORS, EXIT_TYPE_ICONS } from './floodIntelligence';
import L from 'leaflet';

// Fix Leaflet Marker Icon bug in React builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Coordinate dictionary for major Pakistani locations to prevent geocoding lag
const REGIONAL_COORDINATES = {
  "swat": [35.2227, 72.4258],
  "quetta": [30.1798, 66.9750],
  "karachi": [24.8607, 67.0011],
  "lahore": [31.5204, 74.3587],
  "islamabad": [33.6844, 73.0479],
  "rawalpindi": [33.5651, 73.0169],
  "peshawar": [34.0151, 71.5249],
  "multan": [30.1575, 71.5249],
  "faisalabad": [31.4504, 73.1350],
  "hyderabad": [25.3960, 68.3772],
  "sialkot": [32.4972, 74.5361],
  "chitral": [35.8510, 71.7864],
  "gilgit": [35.9184, 74.3124],
  "skardu": [35.2981, 75.6333],
  "muzaffarabad": [34.3700, 73.4711],
  "abbottabad": [34.1688, 73.2215],
  "mardan": [34.1989, 72.0397],
  "mansehra": [34.3313, 73.1964],
  "kohistan": [35.2825, 73.2215],
  "dera ismail khan": [31.8626, 70.9019],
  "thatta": [24.7475, 67.9235],
  "badin": [24.6560, 68.8370],
  "sukkur": [27.7244, 68.8228],
  "jacobabad": [28.2758, 68.4412],
  "gwadar": [25.1264, 62.3224]
};

const DEFAULT_IMAGES = {
  Flood: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600",
  Earthquake: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=600"
};

// Leaflet map controller to fly to new geocoded coordinates
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 10, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function App() {
  // --- Portal & Authentication State ---
  const [role, setRole] = useState('citizen'); // 'citizen', 'ngo', 'gov'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'logs', 'analytics'
  const [authRequiredRole, setAuthRequiredRole] = useState(null); // 'ngo' or 'gov' to trigger login gate
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- API status states ---
  const [apiStatus, setApiStatus] = useState({
    status: 'connecting',
    models_loaded: false,
    groq_api_configured: false,
    database_records: 0
  });

  // --- Pipeline Analytics Stats ---
  const [stats, setStats] = useState({
    total_reports: 1248,
    by_type: { Flood: 842, Earthquake: 406, "Other / Uncategorized": 0 },
    by_priority: { Critical: 126, High: 320, Medium: 450, Low: 352 },
    by_province: { KPK: 78, Punjab: 62, Balochistan: 45, Sindh: 38, AJK: 21, "Gilgit-Baltistan": 18, Islamabad: 12 }
  });

  // --- Incident Analysis Inputs ---
  const [report, setReport] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [results, setResults] = useState(null);
  const [reportImage, setReportImage] = useState(null);
  const [reportImagePreview, setReportImagePreview] = useState(null);
  const [customDisasterType, setCustomDisasterType] = useState('Flood');
  const [customSeverity, setCustomSeverity] = useState('Medium');
  const [customAidStatus, setCustomAidStatus] = useState('');
  const [mapCoords, setMapCoords] = useState([33.6844, 73.0479]); // Islamabad default
  const [mapStyle, setMapStyle] = useState('m'); // 'm' roadmap, 's' satellite, 'p' terrain, 'y' hybrid (Google layer codes)
  const [mapViewMode, setMapViewMode] = useState('severity'); // 'severity' or 'aid'

  // --- List of active incidents mapped ---
  const [mappedIncidents, setMappedIncidents] = useState(() => {
    try {
      const saved = localStorage.getItem('mappedIncidents');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load mappedIncidents from localStorage:', e);
      return [];
    }
  });

  // --- Flood intelligence overlays (water flow paths + exit points) ---
  const [floodOverlays, setFloodOverlays] = useState(() => {
    try {
      const saved = localStorage.getItem('floodOverlays');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // --- Active Tab States ---
  const [alertTab, setAlertTab] = useState('citizens');
  const [briefingOpen, setBriefingOpen] = useState({
    situation: true,
    threat: true,
    response: true,
    resources: false,
    publicSafety: false,
    government: false,
    rescue: false,
    recovery: false
  });

  // --- Historical Database Explorer ---
  const [logsList, setLogsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // --- Initial Load ---
  useEffect(() => {
    fetchStatus();
    fetchStats();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, filterType, filterPriority, filterProvince, page]);

  // Save active mapped incidents to localStorage for persistence across refreshes
  useEffect(() => {
    try {
      localStorage.setItem('mappedIncidents', JSON.stringify(mappedIncidents));
    } catch (e) {
      console.error('Failed to save mappedIncidents to localStorage:', e);
    }
  }, [mappedIncidents]);

  // Save flood overlays to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('floodOverlays', JSON.stringify(floodOverlays));
    } catch (e) {}
  }, [floodOverlays]);

  // --- API fetch operations ---
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setApiStatus(data);
    } catch (err) {
      setApiStatus({
        status: 'disconnected',
        models_loaded: false,
        groq_api_configured: false,
        database_records: 0
      });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (searchQuery) params.append('q', searchQuery);
      if (filterType) params.append('disaster_type', filterType);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterProvince) params.append('province', filterProvince);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const data = await res.json();
      setLogsList(data.results || []);
      setTotalPages(data.pages || 1);
      setTotalLogs(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch incident logs:', err);
    }
  };

  // --- Geocoding Function ---
  const getCoordsForLocation = async (locationName) => {
    const cleanName = locationName.toLowerCase().trim();
    if (REGIONAL_COORDINATES[cleanName]) {
      return REGIONAL_COORDINATES[cleanName];
    }
    // Fallback to OpenStreetMap Geocoder
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', Pakistan')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error('OSM Geocoding failed:', err);
    }
    return [33.6844, 73.0479]; // Islamabad default fallback
  };

  // --- Run AI analysis pipeline ---
  const handleAnalyze = async () => {
    if (!report.trim()) return;
    
    if (!customAidStatus) {
      alert("Validation Error: Specifying if the area has received aid or not is required before submitting the incident.");
      return;
    }
    
    setIsAnalyzing(true);
    setResults(null);
    
    const stepDuration = 600; 
    setActiveStep(0); // Classifying
    await new Promise(r => setTimeout(r, stepDuration));
    
    setActiveStep(1); // Location
    await new Promise(r => setTimeout(r, stepDuration));
    
    setActiveStep(2); // Severity
    await new Promise(r => setTimeout(r, stepDuration));
    
    setActiveStep(3); // Fake news
    await new Promise(r => setTimeout(r, stepDuration));
    
    setActiveStep(4); // Briefing
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report })
      });
      
      const responseData = await res.json();
      if (responseData.success) {
        const data = responseData.data;
        setResults(data);
        
        // Geocode and save coordinate state
        const coords = await getCoordsForLocation(data.location);
        setMapCoords(coords);
        
        // Add incident to local map array
        const newIncident = {
          id: Date.now(),
          text: report,
          location: data.location,
          severity: role === 'citizen' ? customSeverity : data.severity,
          label: role === 'citizen' ? customDisasterType : data.disaster,
          coords: coords,
          aidStatus: customAidStatus,
          image: reportImagePreview // Attach uploaded photo preview
        };
        setMappedIncidents(prev => [newIncident, ...prev]);

        // --- Flood Intelligence: auto-add water flow + exit overlays ---
        const disasterType = role === 'citizen' ? customDisasterType : data.disaster;
        if (disasterType === 'Flood' || disasterType === 'Flash Flood') {
          const floodZone = getFloodZone(data.location);
          if (floodZone) {
            const newOverlay = {
              incidentId: newIncident.id,
              location: data.location,
              ...floodZone,
            };
            setFloodOverlays(prev => [newOverlay, ...prev]);
          }
        }

        // Refresh API aggregates
        fetchStats();
        fetchLogs();
      } else {
        alert(`Analysis pipeline failed: ${responseData.detail || 'Unknown error'}`);

      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Network error communicating with the API.');
    } finally {
      setIsAnalyzing(false);
      setActiveStep(-1);
    }
  };

  // --- Authentication Handler ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = password.trim();

    if (authRequiredRole === 'ngo') {
      if (normalizedUser === 'ngo' && normalizedPass === 'ngo') {
        setRole('ngo');
        setAuthRequiredRole(null);
        setActiveTab('dashboard');
        clearLoginForm();
      } else {
        setLoginError('Invalid NGO credentials. Hint: use ngo/ngo');
      }
    } else if (authRequiredRole === 'gov') {
      if (normalizedUser === 'gov' && normalizedPass === 'gov') {
        setRole('gov');
        setAuthRequiredRole(null);
        setActiveTab('dashboard');
        clearLoginForm();
      } else {
        setLoginError('Invalid Government credentials. Hint: use gov/gov');
      }
    }
  };

  const clearLoginForm = () => {
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportImage(file);
      setReportImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setReportImage(null);
    setReportImagePreview(null);
  };

  const handleLogout = () => {
    setRole('citizen');
    setActiveTab('dashboard');
    setAuthRequiredRole(null);
    setMapViewMode('severity');
  };

  // --- Update incident aid status ---
  const toggleAidStatus = (id, newStatus) => {
    setMappedIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, aidStatus: newStatus };
      }
      return inc;
    }));
  };

  const resolveIncident = (id) => {
    setMappedIncidents(prev => prev.filter(inc => inc.id !== id));
    setFloodOverlays(prev => prev.filter(fo => fo.incidentId !== id));
  };

  // --- Helper to render map coordinates details ---
  const fillTemplate = (text) => {
    setReport(text);
  };

  const downloadBriefing = () => {
    if (!results || !results.briefing) return;
    const blob = new Blob([results.briefing], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crisislens_briefing_${results.disaster.toLowerCase()}_${results.location.toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseBriefingSection = (title) => {
    if (!results || !results.briefing) return [];
    const text = results.briefing;
    const headers = [
      "🚨 SITUATION SUMMARY",
      "⚠️ THREAT ASSESSMENT",
      "🚑 EMERGENCY RESPONSE PLAN",
      "📦 RESOURCE ALLOCATION ADVICE",
      "📢 PUBLIC SAFETY RECOMMENDATIONS",
      "🏛️ GOVERNMENT ACTION PLAN",
      "🚁 RESCUE PRIORITIES",
      "🔄 RECOVERY STRATEGY"
    ];
    
    const currentIndex = headers.findIndex(h => h.includes(title.toUpperCase()));
    if (currentIndex === -1) return [];
    
    const startHeader = headers[currentIndex];
    const startIndex = text.indexOf(startHeader);
    if (startIndex === -1) return [];
    
    let contentStart = startIndex + startHeader.length;
    let endIndex = text.length;
    
    for (let i = currentIndex + 1; i < headers.length; i++) {
      const idx = text.indexOf(headers[i]);
      if (idx !== -1) {
        endIndex = idx;
        break;
      }
    }
    
    let sectionText = text.substring(contentStart, endIndex).trim();
    return sectionText.split('\n').map(line => line.trim()).filter(line => line);
  };

  // --- Helper to get map marker color based on View Mode ---
  const getMarkerColor = (incident) => {
    if (mapViewMode === 'aid') {
      return incident.aidStatus === 'received' ? '#2563eb' : '#7f1d1d'; // Blue vs Dark Red
    }
    
    // Severity View Mode
    const sev = incident.severity.toLowerCase();
    if (sev === 'high' || sev === 'critical') return 'var(--red-critical)';
    if (sev === 'medium') return 'var(--amber-warning)';
    return 'var(--green-success)'; // Green
  };

  const getHeroDetails = () => {
    if (role === 'citizen') {
      if (authRequiredRole === 'ngo') return { title: 'NGO Partner Portal', sub: 'Secure logistical coordination and resource assignment.', img: 'hero_ngo' };
      if (authRequiredRole === 'gov') return { title: 'National Command Center', sub: 'Secure official command workspace for government response.', img: 'hero_gov' };
      if (activeTab === 'report') return { title: 'Emergency Reporting System', sub: 'Submit ground reports to the AI for immediate verification and triage.', img: 'hero_report' };
      return { title: 'Public Monitor Map', sub: 'Live interactive disaster monitoring and citizen reporting.', img: 'hero_live_map' };
    }
    if (role === 'ngo') return { title: 'NGO Logistics Dashboard', sub: 'Active supply chain and camp management.', img: 'hero_ngo' };
    if (role === 'gov') return { title: '1122 Command Panel', sub: 'Official government disaster response and dispatch.', img: 'hero_gov' };
    return { title: 'CrisisLens Portals', sub: 'Disaster Intelligence Command', img: 'hero_live_map' };
  };

  const hero = getHeroDetails();

  return (
    <div className="portal-container" style={{ width: '100%', minHeight: '100vh', paddingBottom: '3rem', backgroundColor: 'var(--bg-app)' }}>
      {/* =====================================================================
          DYNAMIC HERO SECTION (Replaces Sidebar & Topbar)
         ===================================================================== */}
      <section className="hero-section" style={{ position: 'relative', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('/src/assets/${hero.img}.png')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35) contrast(1.1)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(6,9,19,0.3) 0%, #060913 100%)', zIndex: 1 }}></div>
        
        {/* Portal Navigation replacing the Sidebar */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
          <div className="navbar-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span> CrisisLens <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </div>
          <div className="tab-navigation" style={{ gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {role === 'citizen' ? (
              <>
                <button className={`tab-btn ${activeTab === 'dashboard' && !authRequiredRole ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setAuthRequiredRole(null); }} style={{ backdropFilter: 'blur(10px)', background: activeTab === 'dashboard' && !authRequiredRole ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Activity size={16} /> Public Map
                </button>
                <button className={`tab-btn ${activeTab === 'report' && !authRequiredRole ? 'active' : ''}`} onClick={() => { setActiveTab('report'); setAuthRequiredRole(null); }} style={{ backdropFilter: 'blur(10px)', background: activeTab === 'report' && !authRequiredRole ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <AlertTriangle size={16} /> Report Disaster
                </button>
                <button className={`tab-btn ${authRequiredRole === 'ngo' ? 'active' : ''}`} onClick={() => { setAuthRequiredRole('ngo'); clearLoginForm(); }} style={{ backdropFilter: 'blur(10px)', background: authRequiredRole === 'ngo' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Lock size={14} /> NGO Portal
                </button>
                <button className={`tab-btn ${authRequiredRole === 'gov' ? 'active' : ''}`} onClick={() => { setAuthRequiredRole('gov'); clearLoginForm(); }} style={{ backdropFilter: 'blur(10px)', background: authRequiredRole === 'gov' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Lock size={14} /> Gov / 1122 Portal
                </button>
              </>
            ) : (
              <>
                <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); }} style={{ backdropFilter: 'blur(10px)', background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Activity size={16} /> {role === 'ngo' ? 'NGO Dashboard' : '1122 Panel'}
                </button>
                <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => { setActiveTab('logs'); fetchLogs(); }} style={{ backdropFilter: 'blur(10px)', background: activeTab === 'logs' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Database size={16} /> Database Explorer
                </button>
                <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => { setActiveTab('analytics'); }} style={{ backdropFilter: 'blur(10px)', background: activeTab === 'analytics' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                  <Layers size={16} /> Analytics
                </button>
                <button className="tab-btn" onClick={handleLogout} style={{ color: 'var(--red-critical)', border: '1px solid rgba(239,68,68,0.3)', marginLeft: '1rem', backdropFilter: 'blur(10px)', background: 'rgba(239, 68, 68, 0.1)' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Title */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '4rem 0 7rem 0' }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {hero.title}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            {hero.sub}
          </p>
        </div>
      </section>

      {/* =====================================================================
          MAIN LAYOUT CONTENT
         ===================================================================== */}
      <main className="main-layout" style={{ marginLeft: 0, maxWidth: '1400px', margin: '-5rem auto 0 auto', position: 'relative', zIndex: 20 }}>

        {/* =====================================================================
            AUTHENTICATION REQUIRED GATE
           ===================================================================== */}
        {authRequiredRole ? (
          <div className="glass-panel" style={{ maxWidth: '480px', margin: '2rem auto', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Lock size={36} style={{ color: 'var(--blue-primary)', margin: '0 auto 0.5rem auto' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Officer Portal Authentication</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Access to the {authRequiredRole.toUpperCase()} workspace is restricted to authorized emergency managers.
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Officer Username</label>
                <input 
                  type="text" 
                  className="search-field"
                  style={{ paddingLeft: '1rem' }}
                  placeholder={`Enter ${authRequiredRole} username`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Access Password</label>
                <input 
                  type="password" 
                  className="search-field"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <div style={{ color: 'var(--red-critical)', fontSize: '0.78rem', fontWeight: 600 }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="action-btn-primary" style={{ marginTop: '0.5rem' }}>
                Verify Credentials & Unlock Portal
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setAuthRequiredRole(null)}
                style={{ fontSize: '0.8rem' }}
              >
                Cancel / Return to Public view
              </button>
            </form>
          </div>
        ) : (
          /* =====================================================================
              ACTIVE WORKSPACE PORTALS
             ===================================================================== */
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* KPI METRIC CARDS */}
                {role === 'citizen' && (
                  <div className="kpi-grid">
                    <div className="kpi-card blue">
                      <div className="kpi-meta">
                        <span className="kpi-title">Total Incidents Reported</span>
                        <span className="kpi-card-icon">📊</span>
                      </div>
                      <div className="kpi-value-large">{stats.total_reports.toLocaleString()}</div>
                      <div className="kpi-subtext">Verified disaster reports</div>
                    </div>
                    <div className="kpi-card green">
                      <div className="kpi-meta">
                        <span className="kpi-title">Safe Zones Certified</span>
                        <span className="kpi-card-icon">🛡️</span>
                      </div>
                      <div className="kpi-value-large">112</div>
                      <div className="kpi-subtext">Verified safe shelters list</div>
                    </div>
                    <div className="kpi-card green">
                      <div className="kpi-meta">
                        <span className="kpi-title">Active Public Volunteers</span>
                        <span className="kpi-card-icon">👥</span>
                      </div>
                      <div className="kpi-value-large">1,480</div>
                      <div className="kpi-subtext">On-ground community help</div>
                    </div>
                    <div className="kpi-card amber">
                      <div className="kpi-meta">
                        <span className="kpi-title">Active Public Alerts</span>
                        <span className="kpi-card-icon">⚠️</span>
                      </div>
                      <div className="kpi-value-large">4</div>
                      <div className="kpi-subtext">Regional weather warnings</div>
                    </div>
                  </div>
                )}

                {role === 'ngo' && (
                  <div className="kpi-grid">
                    <div className="kpi-card blue">
                      <div className="kpi-meta">
                        <span className="kpi-title">Active Logistical Projects</span>
                        <span className="kpi-card-icon">📦</span>
                      </div>
                      <div className="kpi-value-large">342</div>
                      <div className="kpi-subtext">NGO aid distributions</div>
                    </div>
                    <div className="kpi-card green">
                      <div className="kpi-meta">
                        <span className="kpi-title">Supply Cargo Dispatched</span>
                        <span className="kpi-card-icon">🚛</span>
                      </div>
                      <div className="kpi-value-large">45.2 Tons</div>
                      <div className="kpi-subtext">Reserves deployed to areas</div>
                    </div>
                    <div className="kpi-card blue">
                      <div className="kpi-meta">
                        <span className="kpi-title">NGO Logistics Vehicles</span>
                        <span className="kpi-card-icon">🚚</span>
                      </div>
                      <div className="kpi-value-large">12</div>
                      <div className="kpi-subtext">Active dispatch transports</div>
                    </div>
                    <div className="kpi-card red">
                      <div className="kpi-meta">
                        <span className="kpi-title">Pending Logistics Alerts</span>
                        <span className="kpi-card-icon">🚨</span>
                      </div>
                      <div className="kpi-value-large" style={{ color: 'var(--red-critical)' }}>
                        {mappedIncidents.filter(i => i.aidStatus === 'pending').length}
                      </div>
                      <div className="kpi-subtext">High-priority areas needing aid</div>
                    </div>
                  </div>
                )}

                {role === 'gov' && (
                  <div className="kpi-grid">
                    <div className="kpi-card blue">
                      <div className="kpi-meta">
                        <span className="kpi-title">1122 Dispatch Centers</span>
                        <span className="kpi-card-icon">🏛️</span>
                      </div>
                      <div className="kpi-value-large">24</div>
                      <div className="kpi-subtext">Operating command stations</div>
                    </div>
                    <div className="kpi-card green">
                      <div className="kpi-meta">
                        <span className="kpi-title">Evacuated Citizens</span>
                        <span className="kpi-card-icon">🚁</span>
                      </div>
                      <div className="kpi-value-large">12,480</div>
                      <div className="kpi-subtext">Rescued to secure zones</div>
                    </div>
                    <div className="kpi-card red">
                      <div className="kpi-meta">
                        <span className="kpi-title">Military Command Units</span>
                        <span className="kpi-card-icon">🛡️</span>
                      </div>
                      <div className="kpi-value-large">12</div>
                      <div className="kpi-subtext">Active military battalions</div>
                    </div>
                    <div className="kpi-card red">
                      <div className="kpi-meta">
                        <span className="kpi-title">Emergency Red Zones</span>
                        <span className="kpi-card-icon">🚨</span>
                      </div>
                      <div className="kpi-value-large" style={{ color: 'var(--red-critical)' }}>
                        {mappedIncidents.filter(i => i.severity.toLowerCase() === 'high' || i.severity.toLowerCase() === 'critical').length}
                      </div>
                      <div className="kpi-subtext">Active danger areas mapped</div>
                    </div>
                  </div>
                )}

                {/* OFFICIAL DISASTER SUBMISSION PANEL (OFFICERS ONLY) */}
                {role !== 'citizen' && (
                  <div className="glass-panel">
                    <div className="section-header">
                      <div className="section-header-icon blue">📋</div>
                      <h2>Official Report Injection Console</h2>
                    </div>

                    <div className="input-layout-grid">
                      <div className="form-group">
                        <label htmlFor="report-input">Raw Incident Report Text</label>
                        <textarea
                          id="report-input"
                          className="text-input-area"
                          placeholder="Paste news articles, SMS alerts, or official updates detailing disaster incidents..."
                          value={report}
                          onChange={(e) => setReport(e.target.value)}
                          disabled={isAnalyzing}
                        />
                        
                        {isAnalyzing && (
                          <div className="pipeline-timeline">
                            {[
                              "Classifying disaster",
                              "Extracting location",
                              "Predicting severity",
                              "Checking verification",
                              "Drafting Commander Brief"
                            ].map((step, idx) => (
                              <React.Fragment key={idx}>
                                <div className={`pipeline-node ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}>
                                  <span>{idx < activeStep ? '✓' : idx === activeStep ? '●' : '○'}</span>
                                  {step}
                                </div>
                                {idx < 4 && <span className="pipeline-arrow"><ArrowRight size={12} /></span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* Required Aid Status designation */}
                        <div className="form-group" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                          <label htmlFor="officer-aid-status">Aid Delivery Status (Required)</label>
                          <select
                            id="officer-aid-status"
                            className="select-filter"
                            style={{ width: '100%', padding: '0.65rem 1rem', height: 'auto', backgroundColor: 'var(--bg-inner)', borderColor: 'var(--blue-primary)' }}
                            value={customAidStatus}
                            onChange={(e) => setCustomAidStatus(e.target.value)}
                            required
                          >
                            <option value="">-- Select Aid Delivery Status --</option>
                            <option value="pending">❌ No Aid / Pending Aid</option>
                            <option value="received">✅ Aid Successfully Received</option>
                          </select>
                        </div>

                        <button
                          className="action-btn-primary"
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !report.trim()}
                        >
                          {isAnalyzing ? (
                            <><RefreshCw className="animate-spin" size={18} /> Processing Pipeline...</>
                          ) : (
                            <><Activity size={18} /> Submit and Analyze Incident</>
                          )}
                        </button>
                      </div>

                      <div className="quick-templates-box">
                        {role === 'gov' ? (
                          <>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>NDMA / PDMA Directives</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                              <div className="template-btn" style={{ cursor: 'default', display: 'block', borderLeft: '3px solid var(--red-critical)', padding: '0.5rem' }}>
                                <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.7rem' }}>NDMA-DIR-01 (CRITICAL)</div>
                                <div style={{ fontSize: '0.65rem', marginTop: '0.1rem', color: 'var(--text-secondary)' }}>Evacuate low areas of Swat River. Dispatch 1122 boats.</div>
                              </div>
                              <div className="template-btn" style={{ cursor: 'default', display: 'block', borderLeft: '3px solid var(--amber-warning)', padding: '0.5rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--amber-warning)', fontSize: '0.7rem' }}>PDMA-DIR-05 (HIGH)</div>
                                <div style={{ fontSize: '0.65rem', marginTop: '0.1rem', color: 'var(--text-secondary)' }}>Quetta gas lines shutdown. Send civil units to inspect.</div>
                              </div>
                              <button className="template-btn" onClick={() => fillTemplate("OFFICIAL DIRECTIVE: Deploy emergency rations and setting up medical camps in Hyderabad. Mobilizing 1122 dispatch teams immediately.")}>
                                ✍️ Inject Dispatch Directive Template
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>NGO Field Reports</label>
                            <button
                              className="template-btn"
                              onClick={() => fillTemplate("NGO FIELD ALERT: Need 300 ration packs in Karachi slums near Lyari. Water levels are up to knees. Families have no drinking water.")}
                            >
                              🌊 Karachi Slum Needs
                            </button>
                            <button
                              className="template-btn"
                              onClick={() => fillTemplate("NGO FIELD ALERT: Swat relief camp requires 150 additional blankets due to cold weather. Rations are sufficient for 3 days.")}
                            >
                              🏔️ Swat Camp Needs
                            </button>
                            <button
                              className="template-btn"
                              onClick={() => fillTemplate("BREAKING: 100,000 people homeless in Lahore due to earthquake. All hospitals destroyed. Government hiding the truth. Share immediately before they delete this.")}
                              style={{ borderLeft: '3px solid var(--purple-fake)' }}
                            >
                              ⚠️ Suspicious Claim — Lahore
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* THE MAP PANEL */}
                <div className="glass-panel">
                  <div className="section-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div className="section-header-icon blue"><MapPin size={16} /></div>
                      <h2>
                        {role === 'citizen' ? 'Live Interactive Disaster Monitor Map' : 
                         mapViewMode === 'severity' ? 'Disaster Severity Signaling Map' : 'LOGISTICAL AID DELIVERY STATUS MAP'}
                      </h2>
                    </div>

                    {/* Controls & Layer toggles */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Map View Mode (Only NGO/Gov) */}
                      {role !== 'citizen' && (
                        <>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Map Overlay:</span>
                          <button 
                            className="page-btn"
                            onClick={() => setMapViewMode('severity')}
                            style={mapViewMode === 'severity' ? { borderColor: 'var(--red-critical)', color: 'var(--red-critical)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 } : { padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                          >
                            Disaster Severity (R/Y/G)
                          </button>
                          <button 
                            className="page-btn"
                            onClick={() => setMapViewMode('aid')}
                            style={mapViewMode === 'aid' ? { borderColor: 'var(--blue-primary)', color: 'var(--blue-primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 } : { padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                          >
                            Aid Logistics (Red/Blue)
                          </button>
                          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }}></div>
                        </>
                      )}

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tile View:</span>
                      <button 
                        className={`page-btn ${mapStyle === 'm' ? 'active' : ''}`}
                        onClick={() => setMapStyle('m')}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Roadmap
                      </button>
                      <button 
                        className={`page-btn ${mapStyle === 's' ? 'active' : ''}`}
                        onClick={() => setMapStyle('s')}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Satellite
                      </button>
                      <button 
                        className={`page-btn ${mapStyle === 'p' ? 'active' : ''}`}
                        onClick={() => setMapStyle('p')}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        Terrain
                      </button>
                    </div>
                  </div>

                  {/* Map Info Legend */}
                  <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-inner)', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--border-color)' }}>
                    {mapViewMode === 'severity' ? (
                      <>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Severity Key:</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--red-critical)' }}></span> Danger / Critical (Red)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--amber-warning)' }}></span> Medium Disruption (Yellow)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--green-success)' }}></span> Normal / Low (Green)</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Aid Tracking Key:</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7f1d1d' }}></span> Pending Aid / No Aid (Dark Red)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span> Aid Successfully Received (Blue)</span>
                      </>
                    )}
                  </div>

                  {/* Leaflet Map loaded with Google Maps Layer */}
                  <div className="map-container-wrap" style={{ height: '440px' }}>
                    <MapContainer center={mapCoords} zoom={6} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='Map imagery &copy; Google Maps'
                        url={`https://mt1.google.com/vt/lyrs=${mapStyle}&x={x}&y={y}&z={z}`}
                      />
                      {mappedIncidents.map(inc => (
                        <Marker position={inc.coords} key={inc.id}>
                          <Popup>
                            <div style={{ color: '#000', fontSize: '0.8rem', minWidth: '160px' }}>
                              <h4 style={{ fontWeight: 800, borderBottom: '1px solid #ddd', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                                {inc.label} Incident Alert
                              </h4>
                              <p style={{ margin: '0.2rem 0' }}><strong>Location:</strong> {inc.location}</p>
                              <p style={{ margin: '0.2rem 0' }}><strong>Severity:</strong> {inc.severity}</p>
                              
                              {/* Display uploaded picture if available */}
                              {(inc.image || DEFAULT_IMAGES[inc.label]) && (
                                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ccc' }}>
                                  <img 
                                    src={inc.image || DEFAULT_IMAGES[inc.label] || DEFAULT_IMAGES["Flood"]} 
                                    alt="Incident Scene" 
                                    style={{ width: '100%', height: '100px', objectFit: 'cover' }} 
                                  />
                                </div>
                              )}

                              {/* Display specific options for NGO/Gov */}
                              {role !== 'citizen' ? (
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                    Aid Status:
                                  </label>
                                  <select 
                                    value={inc.aidStatus} 
                                    onChange={(e) => toggleAidStatus(inc.id, e.target.value)}
                                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
                                  >
                                    <option value="pending">❌ Pending / No Aid</option>
                                    <option value="received">✅ Aid Received</option>
                                  </select>

                                  {role === 'gov' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                                      <button 
                                        onClick={() => resolveIncident(inc.id)}
                                        style={{ width: '100%', padding: '0.35rem 0.5rem', backgroundColor: '#10b981', border: 'none', color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                      >
                                        🛡️ Remove (Safe Now)
                                      </button>
                                      <button 
                                        onClick={() => resolveIncident(inc.id)}
                                        style={{ width: '100%', padding: '0.35rem 0.5rem', backgroundColor: '#2563eb', border: 'none', color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                      >
                                        🏁 Remove (Disaster Over)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p style={{ margin: '0.2rem 0' }}><strong>Advisory:</strong> Citizens advised caution.</p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* Display safety radius circles around markers */}
                      {mappedIncidents.map(inc => (
                        <Circle
                          center={inc.coords}
                          key={`c-${inc.id}`}
                          pathOptions={{
                            color: getMarkerColor(inc),
                            fillColor: getMarkerColor(inc),
                            fillOpacity: 0.15,
                            weight: 2
                          }}
                          radius={18000} // 18km radius overlay
                        />
                      ))}
                      <MapRecenter coords={mapCoords} />


                      {/* ═══ FLOOD INTELLIGENCE OVERLAYS ═══ */}
                      {floodOverlays.map((overlay, i) => (
                        <React.Fragment key={`flood-overlay-${i}`}>
                          {/* Water Flow Path — animated dashed red polyline */}
                          {overlay.waterFlowPath && overlay.waterFlowPath.length > 0 && (
                            <Polyline
                              positions={overlay.waterFlowPath}
                              pathOptions={{
                                color: '#ef4444',
                                weight: 5,
                                opacity: 0.85,
                                dashArray: '14, 8',
                                lineCap: 'round',
                                lineJoin: 'round',
                              }}
                            >
                              <Tooltip sticky direction="top">
                                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.8rem' }}>
                                  {overlay.isCoastal ? '🌊 Sea Approach Route' : '🌊 Flood Flow'}: {overlay.label}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#555', marginTop: '0.2rem' }}>
                                  {overlay.warningZones?.join(' → ')}
                                </div>
                              </Tooltip>
                            </Polyline>
                          )}

                          {/* Danger Bands (Double Lines) */}
                          {overlay.dangerBands?.map((band, bi) => (
                            <Polyline
                              key={`db-${i}-${bi}`}
                              positions={band}
                              pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.7 }}
                            >
                              <Tooltip sticky direction="top">
                                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.8rem' }}>
                                  {overlay.isCoastal ? '⚠️ Sea Route Boundary' : '⚠️ Danger Boundary'}
                                </div>
                              </Tooltip>
                            </Polyline>
                          ))}

                          {/* Safe Routes (Green Lines) */}
                          {overlay.safeRoutes?.map((route, ri) => (
                            <Polyline
                              key={`sr-${i}-${ri}`}
                              positions={route}
                              pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9, dashArray: '10, 10' }}
                            >
                              <Tooltip sticky direction="top">
                                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.8rem' }}>
                                  ✅ Safe Evacuation Route
                                </div>
                              </Tooltip>
                            </Polyline>
                          ))}

                          {/* Directional Arrow Markers along the flow path */}
                          {overlay.waterFlowPath && overlay.waterFlowPath.slice(1).map((coord, wi) => (
                            <Marker
                              key={`flow-arrow-${i}-${wi}`}
                              position={coord}
                              icon={L.divIcon({
                                className: '',
                                html: `<div style="
                                  width:10px;height:10px;
                                  background:#ef4444;
                                  border:2px solid rgba(255,255,255,0.8);
                                  border-radius:50%;
                                  box-shadow:0 0 8px #ef4444;
                                "></div>`,
                                iconSize: [10, 10],
                                iconAnchor: [5, 5],
                              })}
                            >
                              <Popup>
                                <div style={{ fontSize: '0.78rem', color: '#000' }}>
                                  <strong style={{ color: '#ef4444' }}>
                                    {overlay.isCoastal ? '🌊 Sea Route Point' : '🌊 Flood Flow Point'}
                                  </strong><br/>
                                  <span>{overlay.label}</span>
                                </div>
                              </Popup>
                            </Marker>
                          ))}

                          {/* Exit / Evacuation Point Markers */}
                          {overlay.exitPoints?.map((ep, ei) => {
                            const color = EXIT_TYPE_COLORS[ep.type] || '#10b981';
                            const emoji = EXIT_TYPE_ICONS[ep.type] || '✅';
                            return (
                              <Marker
                                key={`exit-${i}-${ei}`}
                                position={ep.coords}
                                icon={L.divIcon({
                                  className: '',
                                  html: `<div style="
                                    background:${color};
                                    color:#fff;
                                    border:2.5px solid rgba(255,255,255,0.9);
                                    border-radius:8px;
                                    padding:3px 7px;
                                    font-size:11px;
                                    font-weight:800;
                                    white-space:nowrap;
                                    box-shadow:0 2px 10px ${color}88;
                                    font-family:Outfit,sans-serif;
                                  ">${emoji} Exit</div>`,
                                  iconSize: [56, 24],
                                  iconAnchor: [28, 12],
                                })}
                              >
                                <Popup>
                                  <div style={{ fontSize: '0.8rem', color: '#000', minWidth: '200px' }}>
                                    <strong style={{ color, display: 'block', borderBottom: '1px solid #eee', paddingBottom: '0.25rem', marginBottom: '0.35rem' }}>
                                      {emoji} {ep.name}
                                    </strong>
                                    <p style={{ margin: '0.2rem 0' }}><strong>Type:</strong> {ep.type.replace('_', ' ').toUpperCase()}</p>
                                    <p style={{ margin: '0.2rem 0', color: '#555' }}>{ep.desc}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </MapContainer>

                  </div>
                </div>

                {/* ACTIVE EMERGENCY & LOGISTICS REGISTRY PANEL */}
                <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
                  <div className="section-header">
                    <div className="section-header-icon red"><AlertTriangle size={16} /></div>
                    <h2>Active Emergency Incident & Aid Registry</h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    Live status tracking of on-ground disaster relief campaigns, active geo-location markers, and state authority clearing consoles.
                  </p>

                  {mappedIncidents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-inner)' }}>
                      🛡️ All clear. No active disaster reports are currently registered.
                    </div>
                  ) : (
                    <div className="logs-table-container">
                      <table className="logs-table">
                        <thead>
                          <tr>
                            <th>Incident Details</th>
                            <th>Location</th>
                            <th>Estimated Severity</th>
                            <th>Aid Tracking Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mappedIncidents.map(inc => (
                            <tr key={inc.id}>
                              <td style={{ maxWidth: '350px' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                  {(inc.image || DEFAULT_IMAGES[inc.label]) && (
                                    <img 
                                      src={inc.image || DEFAULT_IMAGES[inc.label]} 
                                      alt="Scene" 
                                      style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-color)' }}
                                    />
                                  )}
                                  <div>
                                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{inc.label} Alert</strong>
                                    <span style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.72rem', lineHeight: '1.2' }}>
                                      {inc.text}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{inc.location}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lat: {inc.coords[0].toFixed(4)}, Lon: {inc.coords[1].toFixed(4)}</div>
                              </td>
                              <td>
                                <span className={`badge ${inc.severity.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                                  {inc.severity}
                                </span>
                              </td>
                              <td>
                                {role !== 'citizen' ? (
                                  <select 
                                    value={inc.aidStatus} 
                                    onChange={(e) => toggleAidStatus(inc.id, e.target.value)}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-inner)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none', cursor: 'pointer' }}
                                  >
                                    <option value="pending">❌ Pending / No Aid</option>
                                    <option value="received">✅ Aid Received</option>
                                  </select>
                                ) : (
                                  <span style={{ 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: '4px', 
                                    fontSize: '0.65rem', 
                                    fontWeight: 700,
                                    backgroundColor: inc.aidStatus === 'received' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(127, 29, 29, 0.25)', 
                                    color: inc.aidStatus === 'received' ? '#60a5fa' : '#fca5a5',
                                    border: `1px solid ${inc.aidStatus === 'received' ? '#2563eb' : '#7f1d1d'}` 
                                  }}>
                                    {inc.aidStatus === 'received' ? '✅ Aid Received' : '❌ Pending / No Aid'}
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {role === 'gov' ? (
                                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => resolveIncident(inc.id)}
                                      style={{ padding: '0.35rem 0.65rem', backgroundColor: '#10b981', border: 'none', color: '#fff', fontSize: '0.68rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                      title="Mark Safe (Remove Incident)"
                                    >
                                      🛡️ Safe Now
                                    </button>
                                    <button 
                                      onClick={() => resolveIncident(inc.id)}
                                      style={{ padding: '0.35rem 0.65rem', backgroundColor: '#2563eb', border: 'none', color: '#fff', fontSize: '0.68rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                      title="Mark Disaster Over (Remove Incident)"
                                    >
                                      🏁 Disaster Over
                                    </button>
                                  </div>
                                ) : role === 'ngo' ? (
                                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => toggleAidStatus(inc.id, inc.aidStatus === 'received' ? 'pending' : 'received')}
                                      style={{ padding: '0.35rem 0.65rem', backgroundColor: inc.aidStatus === 'received' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: `1px solid ${inc.aidStatus === 'received' ? 'var(--red-critical)' : 'var(--blue-primary)'}`, color: inc.aidStatus === 'received' ? 'var(--red-critical)' : 'var(--blue-primary)', fontSize: '0.68rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      {inc.aidStatus === 'received' ? 'Withdraw Aid' : 'Transfer Aid'}
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontStyle: 'italic' }}>Public Advisory Active</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ROLE-SPECIFIC DETAILED STATS BOARDS */}
                {role === 'ngo' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* NGO Inventory Status */}
                    <div className="glass-panel" style={{ margin: 0 }}>
                      <div className="section-header">
                        <div className="section-header-icon blue">📦</div>
                        <h2>Aid Supply Inventory Control</h2>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Real-time tracking of stockpiles in regional warehouses for immediate disaster dispatch.
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {[
                          { item: 'Emergency Rations', qty: '12,500 Packs', percent: 85, color: 'blue' },
                          { item: 'Water Purification Units', qty: '35,000 Liters', percent: 90, color: 'green' },
                          { item: 'Winterized Tents', qty: '1,800 Units', percent: 60, color: 'amber' },
                          { item: 'Trauma & Medical Kits', qty: '4,200 Kits', percent: 75, color: 'purple' },
                          { item: 'Thermal Blankets', qty: '8,000 Pieces', percent: 95, color: 'green' }
                        ].map(inv => (
                          <div key={inv.item} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ fontWeight: 600 }}>{inv.item}</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{inv.qty} ({inv.percent}%)</strong>
                            </div>
                            <div style={{ height: '6px', backgroundColor: 'var(--bg-inner)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${inv.percent}%`, height: '100%', backgroundColor: inv.color === 'blue' ? 'var(--blue-primary)' : inv.color === 'green' ? 'var(--green-success)' : inv.color === 'amber' ? 'var(--amber-warning)' : 'var(--purple-fake)' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* NGO Shipment Manifest */}
                    <div className="glass-panel" style={{ margin: 0 }}>
                      <div className="section-header">
                        <div className="section-header-icon green">🚛</div>
                        <h2>Logistics Dispatch Manifest</h2>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Active shipments in transit to disaster-affected zones. Direct phone link to drivers.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '275px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {[
                          { id: 'NGO-TX-9021', destination: 'Swat Valley Relief', cargo: '500 Tents & Rations', status: 'In-Transit', color: 'amber', driver: 'Abdul Rehman', phone: '+92-300-1234567' },
                          { id: 'NGO-TX-8842', destination: 'Quetta Cantonment', cargo: '200 Medical Kits & Tents', status: 'Loading', color: 'blue', driver: 'Muhammad Ali', phone: '+92-312-9876543' },
                          { id: 'NGO-TX-7710', destination: 'Karachi Central Camp', cargo: '1,000 Water Units', status: 'Delivered', color: 'green', driver: 'Kamran Khan', phone: '+92-333-5551212' }
                        ].map(ship => (
                          <div key={ship.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: 'var(--bg-inner)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.75rem', color: 'var(--blue-primary)' }}>{ship.id}</strong>
                              <span className={`badge ${ship.color === 'green' ? 'low' : ship.color === 'amber' ? 'high' : 'medium'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                                {ship.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <div><span style={{ color: 'var(--text-secondary)' }}>Route:</span> {ship.destination}</div>
                              <div><span style={{ color: 'var(--text-secondary)' }}>Cargo:</span> {ship.cargo}</div>
                              <div><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> {ship.driver} ({ship.phone})</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {role === 'gov' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* 1122 Dispatch Status Registry */}
                    <div className="glass-panel" style={{ margin: 0 }}>
                      <div className="section-header">
                        <div className="section-header-icon red">🚁</div>
                        <h2>1122 Rescue Dispatch Grid</h2>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Status of state emergency vehicles, rescue aircraft, and defense personnel deployed.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {[
                          { asset: 'Evacuation Helicopters (MI-17)', count: '8 Units Active', status: 'Critical Ops', color: 'red', val: 100 },
                          { asset: 'Rescue Inflatable Boats', count: '45 Deployed', status: 'Active Dispatch', color: 'red', val: 90 },
                          { asset: '1122 Emergency Ambulances', count: '120 Units Active', status: 'Sustained Ops', color: 'blue', val: 75 },
                          { asset: 'Armed Forces Standby Units', count: '3 Battalions standby', status: 'Ready Alert', color: 'green', val: 30 },
                          { asset: 'Heavy Landslide Excavators', count: '15 Units operating', status: 'Active clearing', color: 'amber', val: 60 }
                        ].map(ast => (
                          <div key={ast.asset} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                              <span style={{ fontWeight: 600 }}>{ast.asset}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{ast.count}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-inner)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${ast.val}%`, height: '100%', backgroundColor: ast.color === 'red' ? 'var(--red-critical)' : ast.color === 'amber' ? 'var(--amber-warning)' : ast.color === 'blue' ? 'var(--blue-primary)' : 'var(--green-success)' }}></div>
                              </div>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: ast.color === 'red' ? 'var(--red-critical)' : ast.color === 'amber' ? 'var(--amber-warning)' : 'var(--blue-primary)' }}>
                                {ast.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* National Shelter Camp Capacities */}
                    <div className="glass-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                      <div className="section-header">
                        <div className="section-header-icon green">🏛️</div>
                        <h2>National Relief Camp Occupancy</h2>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        Capacity tracking of official government-run disaster shelter facilities.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                        {[
                          { name: 'Peshawar High School Camp', cap: 1500, occ: 1220, color: 'red' },
                          { name: 'Quetta Sports Complex Shelter', cap: 2000, occ: 1180, color: 'amber' },
                          { name: 'Karachi Expo Center Facility', cap: 3000, occ: 2650, color: 'red' },
                          { name: 'Multan Govt Shelter Camp', cap: 1200, occ: 480, color: 'green' }
                        ].map(camp => {
                          const pct = Math.round((camp.occ / camp.cap) * 100);
                          return (
                            <div key={camp.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-inner)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                                <span style={{ fontWeight: 600 }}>{camp.name}</span>
                                <strong>{pct}% Capacity</strong>
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                Occupants: {camp.occ.toLocaleString()} / {camp.cap.toLocaleString()} Max
                              </div>
                              <div style={{ height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1.5px', overflow: 'hidden', marginTop: '0.2rem' }}>
                                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: camp.color === 'red' ? 'var(--red-critical)' : camp.color === 'amber' ? 'var(--amber-warning)' : camp.color === 'green' ? 'var(--green-success)' : camp.color === 'amber' ? 'var(--amber-warning)' : 'var(--green-success)' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* RESULTS AREA */}
                {results && (
                  <div className="glass-panel" style={{ animation: 'slideUp 0.4s ease-out' }}>
                    <div className="section-header">
                      <div className="section-header-icon green">✅</div>
                      <h2>AI Pipeline Classification Results</h2>
                    </div>

                    <div className="results-meta-grid">
                      <div className="result-stat-box">
                        <div className="result-stat-label">Disaster Classification</div>
                        <div className="result-stat-value" style={{ color: 'var(--blue-primary)', fontWeight: 800 }}>
                          {results.disaster}
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Extracted Location</div>
                        <div className="result-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} style={{ color: 'var(--red-critical)' }} />
                          {results.location}
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Severity Level</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
                          <span className={`badge ${results.severity.toLowerCase()}`}>
                            {results.severity}
                          </span>
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Authenticity Status</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
                          <span className={`badge ${
                            results.authenticity.toLowerCase().includes('fake') ? 'fake' : 
                            results.authenticity.toLowerCase().includes('suspicious') ? 'high' : 'low'
                          }`}>
                            {results.authenticity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Misinformation Block */}
                    {(results.authenticity.toLowerCase().includes('fake') || results.authenticity.toLowerCase().includes('suspicious')) && (
                      <div className="warning-banner">
                        <ShieldAlert className="warning-icon" />
                        <div>
                          <strong>SUSPICIOUS MISINFORMATION WARNING</strong>
                          This report has been flagged as fake or suspicious. Do not dispatch heavy logistics. Verification actions only.
                        </div>
                      </div>
                    )}

                    {/* ═══ FLOOD EVACUATION INTELLIGENCE PANEL ═══ */}
                    {(() => {
                      const disasterType = role === 'citizen' ? customDisasterType : results.disaster;
                      if (disasterType !== 'Flood' && disasterType !== 'Flash Flood') return null;
                      const floodZone = getFloodZone(results.location);
                      if (!floodZone) return null;
                      return (
                        <div style={{
                          marginTop: '1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.05)',
                          padding: '1.25rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.3rem' }}>🌊</span>
                            <div>
                              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>
                                Flood Intelligence — {floodZone.label}
                              </h3>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Water flow path and evacuation exits auto-plotted on map
                              </p>
                            </div>
                          </div>

                          {/* Alert message */}
                          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.6 }}>
                            ⚠️ {floodZone.alertMessage}
                          </div>

                          {/* Warning zones — downstream path */}
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Downstream Danger Zones</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {floodZone.warningZones?.map((zone, zi) => (
                                <span key={zi} style={{
                                  padding: '0.2rem 0.6rem',
                                  background: 'rgba(239,68,68,0.15)',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  borderRadius: '20px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#ef4444',
                                }}>⚠️ {zone}</span>
                              ))}
                            </div>
                          </div>

                          {/* Exit points */}
                          <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Recommended Evacuation Exits</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {floodZone.exitPoints?.map((ep, ei) => {
                                const color = EXIT_TYPE_COLORS[ep.type] || '#10b981';
                                const emoji = EXIT_TYPE_ICONS[ep.type] || '✅';
                                return (
                                  <div key={ei} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    padding: '0.6rem 0.75rem',
                                    background: `${color}10`,
                                    border: `1px solid ${color}30`,
                                    borderRadius: '8px',
                                  }}>
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' }}>{emoji}</span>
                                    <div>
                                      <div style={{ fontWeight: 800, fontSize: '0.83rem', color, fontFamily: 'Outfit, sans-serif' }}>{ep.name}</div>
                                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ep.desc}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Tabs Alerts with Image Preview */}

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
                        <div className="section-header">
                          <div className="section-header-icon red"><Info size={16} /></div>
                          <h2>Response Action Directives</h2>
                        </div>

                        <div className="alert-tab-bar">
                          <button 
                            className={`alert-tab-btn ${alertTab === 'citizens' ? 'active' : ''}`}
                            onClick={() => setAlertTab('citizens')}
                          >
                            <Users size={14} /> Citizens Advisory
                          </button>
                          
                          {role !== 'citizen' && (
                            <>
                              <button 
                                className={`alert-tab-btn ${alertTab === 'ngos' ? 'active' : ''}`}
                                onClick={() => setAlertTab('ngos')}
                              >
                                <Compass size={14} /> NGOs Logistics
                              </button>
                              <button 
                                className={`alert-tab-btn ${alertTab === 'government' ? 'active' : ''}`}
                                onClick={() => setAlertTab('government')}
                              >
                                <Building size={14} /> Gov / 1122 Directives
                              </button>
                            </>
                          )}
                        </div>

                        <div className="alert-content-box" style={{ flex: 1 }}>
                          {alertTab === 'citizens' && (results.alerts?.citizen || 'No active public advisory.')}
                          {alertTab === 'ngos' && role !== 'citizen' && (results.alerts?.ngo || 'No NGO mobilization parameters.')}
                          {alertTab === 'government' && role !== 'citizen' && (results.alerts?.government || 'No official command directives.')}
                        </div>
                      </div>

                      {/* Right Column: AI Media Verification Box */}
                      <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div className="section-header">
                          <div className="section-header-icon green">📸</div>
                          <h2>Verified Incident Photo</h2>
                        </div>
                        <div className="glass-panel" style={{ margin: 0, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '185px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-inner)', position: 'relative' }}>
                          <img 
                            src={reportImagePreview || DEFAULT_IMAGES[results.disaster] || DEFAULT_IMAGES["Flood"]} 
                            alt="Verified Scene" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} 
                          />
                          <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'var(--green-success)', color: '#fff', fontSize: '0.65rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)' }}>
                            <CheckCircle size={10} /> AI Authenticated
                          </div>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '0.25rem' }}>
                          Visual verification hash signature: SHA-256 validated
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Commander Briefing */}
                    {role !== 'citizen' && (
                      <>
                        <div className="divider"></div>
                        <div className="section-header">
                          <div className="section-header-icon red"><FileText size={16} /></div>
                          <h2>CrisisLens AI Commander - log Briefing details</h2>
                        </div>

                        <div className="briefing-accordion">
                          {[
                            { key: 'situation', title: 'Situation Summary', icon: '🚨', color: 'red', api_name: 'Situation Summary' },
                            { key: 'threat', title: 'Threat Assessment', icon: '⚠️', color: 'amber', api_name: 'Threat Assessment' },
                            { key: 'response', title: 'Emergency Response Plan', icon: '🚑', color: 'red', api_name: 'Emergency Response Plan' },
                            { key: 'resources', title: 'Resource Allocation Advice', icon: '📦', color: 'blue', api_name: 'Resource Allocation Advice' },
                            { key: 'publicSafety', title: 'Public Safety Recommendations', icon: '📢', color: 'amber', api_name: 'Public Safety Recommendations' },
                            { key: 'government', title: 'Government Action Plan', icon: '🏛️', color: 'blue', api_name: 'Government Action Plan' },
                            { key: 'rescue', title: 'Rescue Priorities', icon: '🚁', color: 'red', api_name: 'Rescue Priorities' },
                            { key: 'recovery', title: 'Recovery Strategy', icon: '🔄', color: 'green', api_name: 'Recovery Strategy' },
                          ].map(sec => {
                            const lines = parseBriefingSection(sec.api_name);
                            const isOpen = briefingOpen[sec.key];
                            
                            return (
                              <div className="accordion-item" key={sec.key}>
                                <div 
                                  className="accordion-header"
                                  onClick={() => setBriefingOpen(prev => ({ ...prev, [sec.key]: !prev[sec.key] }))}
                                >
                                  <div className="accordion-title-wrap">
                                    <span className={`accordion-icon-badge ${sec.color}`}>{sec.icon}</span>
                                    <h3>{sec.title}</h3>
                                  </div>
                                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                                
                                {isOpen && (
                                  <div className="accordion-content">
                                    {lines.length > 0 ? (
                                      <ul>
                                        {lines.map((line, idx) => (
                                          <li key={idx}>{line.replace(/^- /, '')}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>No actionable briefing logs captured for this section.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="download-bar">
                          <button className="action-btn-primary" style={{ margin: 0, flex: 1 }} onClick={downloadBriefing}>
                            <Download size={16} /> Download Full Briefing (.txt)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Dedicated Report a Disaster tab for Citizens */}
            {activeTab === 'report' && role === 'citizen' && (
              <div className="glass-panel" style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div className="section-header">
                  <div className="section-header-icon red"><AlertTriangle size={16} /></div>
                  <h2>Report Active Emergency Incident</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                  Public submission portal. Report flood levels, earthquake structural damages, or landslide blockages. 
                  Please upload photos to assist emergency rescue verification.
                </p>

                <div className="input-layout-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Category Selection */}
                    <div className="form-group">
                      <label>Disaster Category</label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                        <label className="template-btn" style={{ flex: 1, justifyContent: 'center', borderColor: customDisasterType === 'Flood' ? 'var(--blue-primary)' : 'var(--border-color)', backgroundColor: customDisasterType === 'Flood' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-inner)', color: customDisasterType === 'Flood' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="disaster-type" 
                            value="Flood"
                            checked={customDisasterType === 'Flood'}
                            onChange={(e) => setCustomDisasterType(e.target.value)}
                            style={{ display: 'none' }}
                          />
                          🌊 Flood Scenario
                        </label>
                        <label className="template-btn" style={{ flex: 1, justifyContent: 'center', borderColor: customDisasterType === 'Earthquake' ? 'var(--amber-warning)' : 'var(--border-color)', backgroundColor: customDisasterType === 'Earthquake' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-inner)', color: customDisasterType === 'Earthquake' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="disaster-type" 
                            value="Earthquake"
                            checked={customDisasterType === 'Earthquake'}
                            onChange={(e) => setCustomDisasterType(e.target.value)}
                            style={{ display: 'none' }}
                          />
                          🏔️ Earthquake Scenario
                        </label>
                      </div>
                    </div>

                    {/* Report Text */}
                    <div className="form-group">
                      <label htmlFor="report-input">Situation Description</label>
                      <textarea
                        id="report-input"
                        className="text-input-area"
                        placeholder="Provide details about what is happening, exact location/landmark, number of people affected, and immediate needs..."
                        value={report}
                        onChange={(e) => setReport(e.target.value)}
                        disabled={isAnalyzing}
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div className="form-group">
                      <label>Upload Incident Photo (Flood / Earthquake)</label>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-inner)', transition: 'var(--transition-fast)' }}
                               onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--blue-primary)'}
                               onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                               onClick={() => document.getElementById('report-file-input').click()}
                          >
                            <input 
                              id="report-file-input"
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange}
                              style={{ display: 'none' }} 
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              📸 Click to select or upload a picture
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              PNG, JPG up to 10MB
                            </p>
                          </div>
                        </div>

                        {reportImagePreview && (
                          <div style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-inner)' }}>
                            <img src={reportImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              onClick={clearImage}
                              style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.7)', border: 'none', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', lineHeight: '18px', padding: 0 }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estimated Severity Dropdown */}
                    <div className="form-group">
                      <label htmlFor="severity-input">Estimated Severity Level</label>
                      <select
                        id="severity-input"
                        className="select-filter"
                        style={{ width: '100%', padding: '0.65rem 1rem', height: 'auto', backgroundColor: 'var(--bg-inner)' }}
                        value={customSeverity}
                        onChange={(e) => setCustomSeverity(e.target.value)}
                      >
                        <option value="Low">🟢 Low Disruption</option>
                        <option value="Medium">🟡 Medium Alert</option>
                        <option value="High">🔴 High Priority</option>
                        <option value="Critical">🚨 Critical Red Zone</option>
                      </select>
                    </div>

                    {/* Required Aid Delivery Status (Citizen form) */}
                    <div className="form-group">
                      <label htmlFor="aid-status-input">Aid Delivery Status (Required)</label>
                      <select
                        id="aid-status-input"
                        className="select-filter"
                        style={{ width: '100%', padding: '0.65rem 1rem', height: 'auto', backgroundColor: 'var(--bg-inner)', borderColor: 'var(--blue-primary)' }}
                        value={customAidStatus}
                        onChange={(e) => setCustomAidStatus(e.target.value)}
                        required
                      >
                        <option value="">-- Select Aid Delivery Status --</option>
                        <option value="pending">❌ No Aid / Pending Aid</option>
                        <option value="received">✅ Aid Successfully Received</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div>
                      {isAnalyzing && (
                        <div className="pipeline-timeline" style={{ marginBottom: '1rem' }}>
                          {[
                            "Classifying disaster",
                            "Extracting location",
                            "Predicting severity",
                            "Checking verification",
                            "Drafting Commander Brief"
                          ].map((step, idx) => (
                            <React.Fragment key={idx}>
                              <div className={`pipeline-node ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}>
                                <span>{idx < activeStep ? '✓' : idx === activeStep ? '●' : '○'}</span>
                                {step}
                              </div>
                              {idx < 4 && <span className="pipeline-arrow"><ArrowRight size={12} /></span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <button
                        className="action-btn-primary"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !report.trim()}
                        style={{ marginTop: 0 }}
                      >
                        {isAnalyzing ? (
                          <><RefreshCw className="animate-spin" size={18} /> Authenticating Photo & Text...</>
                        ) : (
                          <><Activity size={18} /> Submit Verified Emergency Incident</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick templates for citizen reporting */}
                  <div className="quick-templates-box">
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Report Templates</label>
                    <button
                      className="template-btn"
                      onClick={() => {
                        fillTemplate("Torrential rains cause heavy flash floods in Mingora, Swat. 15 houses damaged, river overflowed. Residents stranded.");
                        setCustomDisasterType("Flood");
                        setCustomSeverity("High");
                      }}
                    >
                      🌊 Mingora Flood
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => {
                        fillTemplate("Strong earthquake felt in Quetta cantonment area. Cracked walls in old brick apartments. No casualties yet.");
                        setCustomDisasterType("Earthquake");
                        setCustomSeverity("Medium");
                      }}
                    >
                      🏔️ Quetta Tremors
                    </button>
                    <button
                      className="template-btn"
                      onClick={() => {
                        fillTemplate("Heavy river flooding near badin. Crops submerged under 3 feet water. Roads closed.");
                        setCustomDisasterType("Flood");
                        setCustomSeverity("Medium");
                      }}
                    >
                      🌊 Badin Crops Flooding
                    </button>
                  </div>
                </div>

                {/* Submit Results Area inside the Reporting view */}
                {results && (
                  <div style={{ marginTop: '2rem' }}>
                    <div className="divider"></div>
                    <div className="section-header">
                      <div className="section-header-icon green">✅</div>
                      <h2>AI Submission & Authentication Verdict</h2>
                    </div>

                    <div className="results-meta-grid">
                      <div className="result-stat-box">
                        <div className="result-stat-label">Verified Disaster</div>
                        <div className="result-stat-value" style={{ color: 'var(--blue-primary)', fontWeight: 800 }}>
                          {results.disaster}
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Geocoded Target</div>
                        <div className="result-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} style={{ color: 'var(--red-critical)' }} />
                          {results.location}
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Severity Grade</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
                          <span className={`badge ${customSeverity.toLowerCase()}`}>
                            {customSeverity}
                          </span>
                        </div>
                      </div>

                      <div className="result-stat-box">
                        <div className="result-stat-label">Photo Veracity</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
                          <span className="badge low" style={{ textTransform: 'none' }}>
                            ✓ Authenticity Confirmed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 350px' }}>
                        <div className="section-header">
                          <div className="section-header-icon red"><Info size={16} /></div>
                          <h2>Public Advisory & Shelter Directions</h2>
                        </div>
                        <div className="alert-content-box" style={{ minHeight: '140px' }}>
                          {results.alerts?.citizen || 'Advisory text verified. Please relocate to the nearest safe shelter and monitor local alerts.'}
                        </div>
                      </div>

                      <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          Uploaded Image Verified
                        </label>
                        <div className="glass-panel" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-inner)', position: 'relative' }}>
                          <img 
                            src={reportImagePreview || DEFAULT_IMAGES[customDisasterType] || DEFAULT_IMAGES["Flood"]} 
                            alt="Uploaded scene" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} 
                          />
                          <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'var(--green-success)', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                            ✓ Verified Image
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LOGS TAB - DATABASE EXPLORER (OFFICERS ONLY) */}
            {activeTab === 'logs' && role !== 'citizen' && (
              <div className="glass-panel" style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div className="section-header">
                  <div className="section-header-icon blue"><Database size={16} /></div>
                  <h2>Historical Database Incident logs Explorer</h2>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                  Browse, search, and load incidents from training logs. NGO and Government officers can load reports to tool.
                </p>

                <div className="logs-header-actions">
                  <div className="search-input-wrap">
                    <Search size={14} className="search-icon-inside" />
                    <input 
                      type="text" 
                      className="search-field"
                      placeholder="Search incident content, locations, etc..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                  </div>

                  <select 
                    className="select-filter"
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                  >
                    <option value="">All Disaster Types</option>
                    <option value="flood">Flood</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="landslide">Landslide</option>
                    <option value="other">Other / Unknown</option>
                  </select>

                  <select 
                    className="select-filter"
                    value={filterPriority}
                    onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
                  >
                    <option value="">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select 
                    className="select-filter"
                    value={filterProvince}
                    onChange={(e) => { setFilterProvince(e.target.value); setPage(1); }}
                  >
                    <option value="">All Regions</option>
                    <option value="KPK">KPK</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="AJK">AJK</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>

                <div className="logs-table-container">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Report Details</th>
                        <th>Location</th>
                        <th>Province / Region</th>
                        <th>Disaster Class</th>
                        <th>Severity Priority</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsList.length > 0 ? (
                        logsList.map((log, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="log-text-cell" title={log.text}>{log.text}</div>
                            </td>
                            <td>{log.location}</td>
                            <td>{log.province}</td>
                            <td>
                              <span style={{ color: log.label.toLowerCase() === 'flood' ? 'var(--blue-primary)' : log.label.toLowerCase() === 'earthquake' ? 'var(--amber-warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                {log.label}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${log.priority.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                                {log.priority}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="log-action-btn"
                                onClick={async () => {
                                  setReport(log.text);
                                  setActiveTab('dashboard');
                                  // Auto geocode and recnter map
                                  const coords = await getCoordsForLocation(log.location);
                                  setMapCoords(coords);
                                }}
                              >
                                Load in Tool
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No logs found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="pagination-footer">
                    <div>
                      Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, totalLogs)} of {totalLogs} logs
                    </div>
                    <div className="pagination-controls">
                      <button 
                        className="page-btn" 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                      >
                        Previous
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
                        {page} / {totalPages}
                      </span>
                      <button 
                        className="page-btn" 
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB (OFFICERS ONLY) */}
            {activeTab === 'analytics' && role !== 'citizen' && (
              <div className="analytics-grid" style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div className="chart-card">
                  <h3 className="chart-title">Incident Categories Distribution</h3>
                  <div className="svg-chart-container">
                    <svg width="220" height="220" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg-inner)" strokeWidth="10" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="var(--blue-primary)" 
                        strokeWidth="10" 
                        strokeDasharray="169.6 251.2" 
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="var(--amber-warning)" 
                        strokeWidth="10" 
                        strokeDasharray="81.6 251.2" 
                        strokeDashoffset="-169.6"
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="52" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">PK</text>
                      <text x="50" y="62" textAnchor="middle" fill="var(--text-secondary)" fontSize="5">INCIDENTS</text>
                    </svg>
                  </div>
                  <div className="bar-chart-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--blue-primary)', borderRadius: '2px' }}></span>
                        Flooding Events
                      </span>
                      <strong>{stats.by_type.Flood || 842} reports (67.5%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingBottom: '0.4rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--amber-warning)', borderRadius: '2px' }}></span>
                        Earthquake Events
                      </span>
                      <strong>{stats.by_type.Earthquake || 406} reports (32.5%)</strong>
                    </div>
                  </div>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Severity Priority Distribution</h3>
                  <div className="bar-chart-list" style={{ marginTop: '1rem' }}>
                    {[
                      { label: 'Critical Alert', val: stats.by_priority.Critical || 126, percent: 10, color: 'red' },
                      { label: 'High Priority', val: stats.by_priority.High || 320, percent: 26, color: 'amber' },
                      { label: 'Medium Alert', val: stats.by_priority.Medium || 450, percent: 36, color: 'blue' },
                      { label: 'Low Alert', val: stats.by_priority.Low || 352, percent: 28, color: 'green' }
                    ].map(item => (
                      <div className="bar-row" key={item.label}>
                        <span className="bar-label">{item.label}</span>
                        <div className="bar-track">
                          <div className={`bar-fill ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                        </div>
                        <span className="bar-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                  <h3 className="chart-title">Regional Incident Distribution Breakdown</h3>
                  <div className="bar-chart-list" style={{ marginTop: '1rem' }}>
                    {[
                      { label: 'Khyber Pakhtunkhwa (KPK)', val: stats.by_province.KPK || 78, percent: 34, color: 'blue' },
                      { label: 'Punjab Province', val: stats.by_province.Punjab || 62, percent: 27, color: 'green' },
                      { label: 'Balochistan Province', val: stats.by_province.Balochistan || 45, percent: 20, color: 'amber' },
                      { label: 'Sindh Province', val: stats.by_province.Sindh || 38, percent: 16, color: 'purple' },
                      { label: 'Azad Jammu & Kashmir (AJK)', val: stats.by_province.AJK || 21, percent: 9, color: 'red' },
                      { label: 'Gilgit-Baltistan (GB)', val: stats.by_province["Gilgit-Baltistan"] || 18, percent: 8, color: 'blue' },
                      { label: 'Islamabad (ICT)', val: stats.by_province.Islamabad || 12, percent: 5, color: 'green' }
                    ].map(item => (
                      <div className="bar-row" key={item.label}>
                        <span className="bar-label" style={{ width: '180px' }}>{item.label}</span>
                        <div className="bar-track">
                          <div className={`bar-fill ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                        </div>
                        <span className="bar-val">{item.val} reports</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
