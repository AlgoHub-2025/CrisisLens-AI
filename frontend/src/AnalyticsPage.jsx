import React from 'react';
import './HomePage.css';
import { ArrowRight, BarChart3, TrendingUp, PieChart, Database } from 'lucide-react';

export default function AnalyticsPage({ onLaunch }) {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg" style={{ backgroundImage: "url('/src/assets/hero_analytics.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="project-title" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Data-Driven Insights</h1>
          <p className="project-subtitle">
            Explore incident trends, regional response metrics, and resource allocation efficiency.
          </p>
          <button className="cta-button" onClick={onLaunch}>
            Open Analytics Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Deep <span>Intelligence</span></h2>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>
                The <strong>Analytics Module</strong> aggregates vast amounts of structured and unstructured crisis data to provide high-level visibility to policymakers and NGO directors.
              </p>
              <p>
                By tracking historical trends and mapping them against current resource deployments, we can identify critical bottlenecks in the supply chain, track the authenticity rate of incoming reports, and measure overall response time across different provinces.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', color: '#06b6d4' }}>
                    <BarChart3 size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Provincial Reports</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Macro-level view of disaster impact per region.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>Historical Trends</h4>
                    <p style={{ color: '#8899bb', fontSize: '0.9rem', margin: 0 }}>Analyze past events to predict future resource needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS CHARTS SECTION */}
      <section className="analytics-charts-section" style={{ padding: '4rem 2rem', background: '#04060d' }}>
        <div className="section-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">Province <span>Analytics</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time breakdown of incident volume across major provinces.</p>
          </div>
          
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div className="charts-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { name: 'KPK', val: 78, color: '#ef4444' },
                { name: 'Punjab', val: 62, color: '#f59e0b' },
                { name: 'Balochistan', val: 45, color: '#3b82f6' },
                { name: 'Sindh', val: 38, color: '#10b981' },
                { name: 'AJK', val: 21, color: '#8b5cf6' }
              ].map(prov => (
                <div key={prov.name} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                    <span style={{ fontWeight: 600 }}>{prov.name}</span>
                    <span style={{ color: prov.color, fontWeight: 800 }}>{prov.val}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${prov.val}%`, height: '100%', background: prov.color, borderRadius: '4px', boxShadow: `0 0 10px ${prov.color}` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="stats-grid-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="kpi-card" style={{ padding: '1.5rem' }}>
                <div className="kpi-title" style={{ color: '#06b6d4' }}>Total Processed</div>
                <div className="kpi-value-large" style={{ marginTop: '0.5rem' }}>14,592</div>
                <div className="kpi-subtext">Reports this week</div>
              </div>
              <div className="kpi-card" style={{ padding: '1.5rem' }}>
                <div className="kpi-title" style={{ color: '#10b981' }}>Fake News Filtered</div>
                <div className="kpi-value-large" style={{ marginTop: '0.5rem' }}>94.2%</div>
                <div className="kpi-subtext">AI accuracy rate</div>
              </div>
              <div className="kpi-card" style={{ padding: '1.5rem' }}>
                <div className="kpi-title" style={{ color: '#ef4444' }}>Critical Alerts</div>
                <div className="kpi-value-large" style={{ marginTop: '0.5rem' }}>112</div>
                <div className="kpi-subtext">Active dispatches</div>
              </div>
              <div className="kpi-card" style={{ padding: '1.5rem' }}>
                <div className="kpi-title" style={{ color: '#f59e0b' }}>Resource Matching</div>
                <div className="kpi-value-large" style={{ marginTop: '0.5rem' }}>87%</div>
                <div className="kpi-subtext">Optimal allocation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Key <span>Metrics</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Database size={32} /></div>
              <h3>Data Integrity</h3>
              <p>Monitors the ratio of verified vs. fake news reports in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><PieChart size={32} /></div>
              <h3>Resource Allocation</h3>
              <p>Visualizes where supplies are currently deployed vs where they are most needed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><TrendingUp size={32} /></div>
              <h3>Severity Tracking</h3>
              <p>Tracks the escalation of disaster severity over a 7-day trailing period.</p>
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
