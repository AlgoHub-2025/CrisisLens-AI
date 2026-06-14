import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { ArrowRight, Compass, Navigation, Radio, MapPin, RefreshCw, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { EXIT_TYPE_COLORS, EXIT_TYPE_ICONS } from './floodIntelligence';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_IMAGES = {
  Flood: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600",
  Earthquake: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=600"
};

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 10, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

const getMarkerColor = (inc) => {
  if (!inc) return '#3b82f6';
  const sev = (inc.severity || '').toLowerCase();
  if (sev === 'critical') return '#ef4444';
  if (sev === 'high') return '#f59e0b';
  if (sev === 'medium') return '#3b82f6';
  return '#10b981';
};

export default function LiveMapPage({ onLaunch }) {
  const [mappedIncidents, setMappedIncidents] = useState([]);
  const [floodOverlays, setFloodOverlays] = useState([]);
  const [mapStyle, setMapStyle] = useState('m');
  const [mapCoords] = useState([30.8, 70.5]); // Center Pakistan
  const [lastRefresh, setLastRefresh] = useState('');

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('mappedIncidents');
      const parsed = saved ? JSON.parse(saved) : [];
      setMappedIncidents(parsed);
    } catch (e) { setMappedIncidents([]); }
    try {
      const savedOverlays = localStorage.getItem('floodOverlays');
      const parsedOverlays = savedOverlays ? JSON.parse(savedOverlays) : [];
      setFloodOverlays(parsedOverlays);
    } catch (e) { setFloodOverlays([]); }
    setLastRefresh(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    loadFromStorage();
    // Refresh every 30 seconds automatically
    const interval = setInterval(loadFromStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg" style={{ backgroundImage: "url('/src/assets/hero_live_map.png')" }}></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="project-title" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Live Crisis Mapping
          </h1>
          <p className="project-subtitle">
            Real-time geospatial intelligence and continuous active zone tracking across Pakistan.
          </p>
          <button className="cta-button" onClick={onLaunch}>
            Open Command Center <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* FULL-WIDTH LIVE MAP SECTION */}
      <section style={{ padding: '4rem 2rem', background: '#04060d' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>

          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Map size={18} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Live Interactive Disaster Monitor Map
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                  {mappedIncidents.length} incident{mappedIncidents.length !== 1 ? 's' : ''} mapped
                  {lastRefresh && <span style={{ marginLeft: '0.75rem', color: '#475569' }}>· Updated {lastRefresh}</span>}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tile View:</span>
              {[
                { key: 'm', label: 'Roadmap' },
                { key: 's', label: 'Satellite' },
                { key: 'p', label: 'Terrain' },
                { key: 'y', label: 'Hybrid' },
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setMapStyle(btn.key)}
                  style={{
                    padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 700,
                    borderRadius: '6px', cursor: 'pointer', border: '1px solid',
                    borderColor: mapStyle === btn.key ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    color: mapStyle === btn.key ? '#3b82f6' : 'var(--text-secondary)',
                    background: mapStyle === btn.key ? 'rgba(59,130,246,0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >{btn.label}</button>
              ))}
              <button
                onClick={loadFromStorage}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 700,
                  borderRadius: '6px', cursor: 'pointer',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', background: 'rgba(16,185,129,0.08)',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Legend Row */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Severity Key:</span>
            {[
              { color: '#ef4444', label: 'Critical (Red)' },
              { color: '#f59e0b', label: 'High (Amber)' },
              { color: '#3b82f6', label: 'Medium (Blue)' },
              { color: '#10b981', label: 'Low (Green)' },
            ].map(item => (
              <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block', boxShadow: `0 0 6px ${item.color}` }}></span>
                {item.label}
              </span>
            ))}
          </div>

          {/* MAP */}
          <div className="map-container-wrap" style={{ height: '580px' }}>
            <MapContainer
              center={mapCoords}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution="Map imagery &copy; Google Maps"
                url={`https://mt1.google.com/vt/lyrs=${mapStyle}&x={x}&y={y}&z={z}`}
              />

              {/* Incident Markers */}
              {mappedIncidents.map(inc => (
                <Marker position={inc.coords} key={inc.id}>
                  <Popup>
                    <div style={{ color: '#000', fontSize: '0.8rem', minWidth: '180px' }}>
                      <h4 style={{ fontWeight: 800, borderBottom: '1px solid #ddd', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                        {inc.label} Incident Alert
                      </h4>
                      <p style={{ margin: '0.2rem 0' }}><strong>Location:</strong> {inc.location}</p>
                      <p style={{ margin: '0.2rem 0' }}><strong>Severity:</strong> {inc.severity}</p>
                      {(inc.image || DEFAULT_IMAGES[inc.label]) && (
                        <div style={{ marginTop: '0.5rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ccc' }}>
                          <img
                            src={inc.image || DEFAULT_IMAGES[inc.label] || DEFAULT_IMAGES['Flood']}
                            alt="Incident"
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <p style={{ margin: '0.35rem 0 0' }}><strong>Advisory:</strong> Citizens advised caution.</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Severity Radius Circles */}
              {mappedIncidents.map(inc => (
                <Circle
                  key={`c-${inc.id}`}
                  center={inc.coords}
                  pathOptions={{
                    color: getMarkerColor(inc),
                    fillColor: getMarkerColor(inc),
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                  radius={18000}
                />
              ))}

              <MapRecenter coords={mapCoords} />


              {/* ═══ FLOOD INTELLIGENCE OVERLAYS ═══ */}
              {floodOverlays.map((overlay, i) => (
                <React.Fragment key={`fo-${i}`}>
                  {/* Water flow path — dashed red polyline */}
                  {overlay.waterFlowPath && overlay.waterFlowPath.length > 0 && (
                    <Polyline
                      positions={overlay.waterFlowPath}
                      pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.85, dashArray: '14, 8' }}
                    >
                      <Tooltip sticky direction="top">
                        <span style={{ fontWeight: 700, color: '#ef4444' }}>
                          {overlay.isCoastal ? '🌊 Sea Approach Route' : '🌊 Flood Flow'}: {overlay.label}
                        </span>
                        <br />
                        <span style={{ fontSize: '0.72rem' }}>{overlay.warningZones?.join(' → ')}</span>
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
                        <span style={{ fontWeight: 700, color: '#ef4444' }}>
                          {overlay.isCoastal ? '⚠️ Sea Route Boundary' : '⚠️ Danger Boundary'}
                        </span>
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
                        <span style={{ fontWeight: 700, color: '#10b981' }}>✅ Safe Evacuation Route</span>
                      </Tooltip>
                    </Polyline>
                  ))}

                  {/* Flow dots along path */}
                  {overlay.waterFlowPath && overlay.waterFlowPath.slice(1).map((coord, wi) => (
                    <Marker key={`fpt-${i}-${wi}`} position={coord} icon={L.divIcon({
                      className: '',
                      html: `<div style="width:10px;height:10px;background:#ef4444;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px #ef4444;"></div>`,
                      iconSize: [10, 10], iconAnchor: [5, 5],
                    })}>
                      <Popup>
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>
                          {overlay.isCoastal ? '🌊 Sea Route Point' : '🌊 Flood Flow'}: {overlay.label}
                        </span>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Exit point markers */}
                  {overlay.exitPoints?.map((ep, ei) => {
                    const color = EXIT_TYPE_COLORS[ep.type] || '#10b981';
                    const emoji = EXIT_TYPE_ICONS[ep.type] || '✅';
                    return (
                      <Marker key={`ep-${i}-${ei}`} position={ep.coords} icon={L.divIcon({
                        className: '',
                        html: `<div style="background:${color};color:#fff;border:2.5px solid rgba(255,255,255,0.9);border-radius:8px;padding:3px 7px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 2px 10px ${color}88;font-family:Outfit,sans-serif;">${emoji} Exit</div>`,
                        iconSize: [56, 24], iconAnchor: [28, 12],
                      })}>
                        <Popup>
                          <div style={{ fontSize: '0.8rem', minWidth: '200px' }}>
                            <strong style={{ color }}>{emoji} {ep.name}</strong>
                            <p style={{ color: '#555', margin: '0.3rem 0 0' }}>{ep.desc}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>


          {/* Active Incident Registry */}
          <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <div className="section-header-icon red"><MapPin size={16} /></div>
              <h2>Active Emergency Incident Registry</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Live status tracking of on-ground disaster relief campaigns and active geo-location markers.
            </p>

            {mappedIncidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                <MapPin size={40} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '0.9rem' }}>No incidents submitted yet. Use the Command Center to submit your first disaster report.</p>
                <button className="cta-button" onClick={onLaunch} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', display: 'inline-flex' }}>
                  Go to Command Center <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {mappedIncidents.map(inc => {
                  const color = getMarkerColor(inc);
                  return (
                    <div key={inc.id} style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: `1px solid ${color}33`,
                      background: `${color}0a`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '3px 0 0 3px' }}></div>
                      <div style={{ paddingLeft: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif' }}>{inc.label}</span>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, background: `${color}20`, color, border: `1px solid ${color}40`, textTransform: 'uppercase' }}>
                            {inc.severity}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>📍 {inc.location}</p>
                        {inc.text && <p style={{ color: '#6b7280', fontSize: '0.72rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{inc.text.slice(0, 100)}{inc.text.length > 100 ? '...' : ''}</p>}
                        {inc.aidStatus && <p style={{ marginTop: '0.3rem', fontSize: '0.7rem', color: inc.aidStatus === 'received' ? '#10b981' : '#ef4444' }}>
                          {inc.aidStatus === 'received' ? '✅ Aid Received' : '❌ Aid Pending'}
                        </p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Live <span>Features</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Radio size={32} /></div>
              <h3>Live Data Streams</h3>
              <p>Automatically fetches and renders verified ground reports as they happen.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Navigation size={32} /></div>
              <h3>Google Maps Tiles</h3>
              <p>Roadmap, Satellite, Terrain, and Hybrid tile layers for full situational awareness.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Compass size={32} /></div>
              <h3>Severity Radius Circles</h3>
              <p>Colored 18km radius overlays clearly visualize the affected area of each incident.</p>
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
