import React from 'react';
import './HomePage.css';
import { ArrowRight, Activity, Map, ShieldAlert, Zap } from 'lucide-react';

export default function HomePage({ onLaunch }) {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg" style={{ backgroundImage: "url('/src/assets/hero_bg.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="project-title">CrisisLens AI</h1>
          <p className="project-subtitle">
            Advanced AI-powered disaster intelligence, live response routing, 
            and automated emergency planning for Pakistan.
          </p>
          <button className="cta-button" onClick={onLaunch}>
            Launch Command Center <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About <span>The Project</span></h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>
                <strong>CrisisLens AI</strong> is a next-generation command center built to transform how we respond to natural disasters in Pakistan. With the increasing frequency of floods and earthquakes, timely and accurate information is critical.
              </p>
              <p>
                Our platform ingests raw reports from citizens and field workers, utilizes advanced AI models to classify the severity, extract precise geolocation data, and detect potential fake news.
              </p>
              <p>
                <strong>Utilization:</strong> It serves as a unified portal for <strong>Citizens</strong> to report incidents and find safe zones, <strong>NGOs</strong> to coordinate logistical aid, and <strong>Government / 1122 dispatch units</strong> to orchestrate high-priority rescue and recovery missions.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', color: '#4ade80' }}>
                    <Activity size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Real-time Processing</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Millisecond inference for incoming reports</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Fake News Detection</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Filtering out misinformation automatically</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(245, 166, 35, 0.1)', borderRadius: '12px', color: '#f5a623' }}>
                    <Map size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Intelligent Mapping</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Auto-geocoding regional disaster locations</p>
                  </div>
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
            <h2 className="section-title">Core <span>Capabilities</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Zap size={32} /></div>
              <h3>AI Briefing Generation</h3>
              <p>Automatically synthesizes raw emergency reports into structured military-grade briefings spanning threat assessment to recovery strategy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShieldAlert size={32} /></div>
              <h3>Severity Prediction</h3>
              <p>Uses predictive models to assess the actual severity (Critical, High, Medium, Low) of incidents without human bias.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Map size={32} /></div>
              <h3>Role-Based Workspaces</h3>
              <p>Tailored dashboards for citizens to seek help, NGOs to distribute supplies, and Gov to orchestrate mass evacuations.</p>
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
