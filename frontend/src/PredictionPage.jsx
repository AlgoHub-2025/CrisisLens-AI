import React from 'react';
import './HomePage.css';
import { ArrowRight, Radar, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function PredictionPage({ onLaunch }) {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg" style={{ backgroundImage: "url('/src/assets/hero_prediction.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="project-title" style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Early Warning System</h1>
          <p className="project-subtitle">
            Leverage predictive models to forecast disaster severity before it peaks.
          </p>
          <button className="cta-button" onClick={onLaunch}>
            Run Prediction Models <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Severity <span>Forecasting</span></h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>
                The <strong>Prediction Engine</strong> shifts our operational model from reactive to proactive. By analyzing early incident reports, historical disaster footprints, and geographical risk factors, the AI can forecast the ultimate severity of a crisis.
              </p>
              <p>
                This allows government agencies like 1122 and PDMA to mobilize mass evacuation efforts or stage heavy machinery days in advance, significantly reducing the loss of life and infrastructure damage.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', color: '#a855f7' }}>
                    <Radar size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Risk Probability</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Calculates the likelihood of an event escalating.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Vulnerability Assessment</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Identifies weak infrastructure in the projected path.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREDICTION UI SECTION */}
      <section className="prediction-ui-section" style={{ padding: '4rem 2rem', background: '#04060d' }}>
        <div className="section-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">Model <span>Parameters</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Configure AI inputs for regional severity forecasting.</p>
          </div>
          
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8899bb', marginBottom: '0.5rem', fontWeight: 600 }}>Target Region</label>
                <select style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                  <option>Select Province...</option>
                  <option>KPK - Nowshera</option>
                  <option>Punjab - Lahore</option>
                  <option>Sindh - Karachi</option>
                  <option>Balochistan - Quetta</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8899bb', marginBottom: '0.5rem', fontWeight: 600 }}>Event Type</label>
                <select style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                  <option>Flash Flood</option>
                  <option>Earthquake</option>
                  <option>Urban Fire</option>
                  <option>Landslide</option>
                </select>
              </div>
              <button className="action-btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #6b21a8)', marginTop: '1rem', border: 'none' }}>
                <Cpu size={20} /> Run AI Prediction Matrix
              </button>
            </div>

            <div className="prediction-results" style={{ padding: '2rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '50%', color: '#a855f7' }}>
                  <Radar size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>System Idle</h3>
                  <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Awaiting parameters...</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#8899bb' }}>Estimated Severity</span>
                  <span style={{ fontWeight: 800, color: '#555' }}>---</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#8899bb' }}>Population at Risk</span>
                  <span style={{ fontWeight: 800, color: '#555' }}>---</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8899bb' }}>Required Action</span>
                  <span style={{ fontWeight: 800, color: '#555' }}>---</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Forecasting <span>Capabilities</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Cpu size={32} /></div>
              <h3>Machine Learning Core</h3>
              <p>Trained on thousands of historical disaster records from Pakistan to recognize early warning signs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size={32} /></div>
              <h3>Bias-Free Assessment</h3>
              <p>Removes human panic from the equation, providing a clinical evaluation of the threat level.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><AlertTriangle size={32} /></div>
              <h3>Pre-emptive Alerts</h3>
              <p>Triggers automated warnings to registered citizens in the predicted risk zone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="developed-by">
            developed by <span className="algotitans">algotitans</span>
          </div>
          <p style={{ color: '#5577aa', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            © {new Date().getFullYear()} CrisisLens AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
