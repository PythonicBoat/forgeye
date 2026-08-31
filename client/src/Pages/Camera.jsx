import React, { useState } from 'react';
import Feed from '../Components/Feed';
import { useSimulation } from '../context/SimulationContext';

const AVAILABLE_CHANNELS = [
  { id: 'BF1', name: 'Blast Furnace 1 Floor', zone: 'Ironmaking' },
  { id: 'BF2', name: 'Blast Furnace 2 Floor', zone: 'Ironmaking' },
  { id: 'BOF', name: 'BOF Refining Vessel', zone: 'Converter Shop' },
  { id: 'LF1', name: 'Ladle Furnace 1 Bay', zone: 'Secondary Metallurgy' },
  { id: 'LF2', name: 'Ladle Furnace 2 Bay', zone: 'Secondary Metallurgy' },
  { id: 'RH', name: 'RH Degasser Stand', zone: 'Degassing Bay' },
  { id: 'CC1', name: 'Continuous Casting 1', zone: 'Caster Floor' },
  { id: 'CC2', name: 'Continuous Casting 2', zone: 'Caster Floor' },
  { id: 'SLAG', name: 'Slag Dumping Site', zone: 'Waste Yard' }
];

export default function Camera() {
  const { ladles, manualAnomalies } = useSimulation();
  const [layout, setLayout] = useState('grid-3x3'); 
  const [cvFilter, setCvFilter] = useState('ALL'); 
  const [focalCam, setFocalCam] = useState('BOF');

  const activeChannels = layout === 'grid-2x2' 
    ? AVAILABLE_CHANNELS.slice(0, 4) 
    : layout === 'focal'
      ? AVAILABLE_CHANNELS.filter(c => c.id === focalCam)
      : AVAILABLE_CHANNELS;

  const getCVEvents = () => {
    const events = [];
    
    ladles.forEach(l => {
      if (l.hotspotDetected) {
        events.push({
          id: `EV-IR-${l.ladleId}`,
          camera: `CAM-${l.location}`,
          severity: l.hotspotSeverity,
          label: `HOTSPOT DETECTED: ${l.ladleId}`,
          details: `Delta: +${l.hotspotDelta}°C | Est. Loss: ${l.hotspotSize * 4}MW`,
          time: new Date().toLocaleTimeString()
        });
      }
    });

    if (manualAnomalies.ppeViolation) {
      events.push({
        id: `EV-PPE-${manualAnomalies.ppeViolation}`,
        camera: `CAM-${manualAnomalies.ppeViolation}`,
        severity: 'CRITICAL',
        label: 'SAFETY COMPLIANCE EXCEEDED',
        details: 'Operator on tap floor missing required hardhat!',
        time: new Date().toLocaleTimeString()
      });
    }

    if (manualAnomalies.spill) {
      events.push({
        id: `EV-SPL-${manualAnomalies.spill}`,
        camera: `CAM-${manualAnomalies.spill}`,
        severity: 'CRITICAL',
        label: 'MOLTEN METAL RUNOUT',
        details: `Vessel slag overflow detected on ${manualAnomalies.spill}`,
        time: new Date().toLocaleTimeString()
      });
    }

    return events;
  };

  return (
    <div className="h-[100vh] w-full flex flex-col bg-black text-white font-pixel">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-black border-b-2 border-slate-800 flex justify-between items-center flex-wrap gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            [SURVEILLANCE VIDEO PORT MONITOR]
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Monitoring feed overlay • Edge video analytics interface
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-sm">
          {/* Filters */}
          <div className="flex items-center bg-black border border-slate-800 p-1 rounded">
            <span className="px-2 text-slate-500 font-mono text-xs">PIPELINES:</span>
            {[
              { id: 'ALL', label: 'ALL CHANNELS' },
              { id: 'THERMAL', label: 'IR THERMAL' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCvFilter(f.id)}
                className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                  cvFilter === f.id
                    ? 'bg-white text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Layouts */}
          <div className="flex items-center bg-black border border-slate-800 p-1 rounded">
            {[
              { id: 'focal', label: 'FOCAL' },
              { id: 'grid-2x2', label: '2x2 GRID' },
              { id: 'grid-3x3', label: '3x3 MULTI' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                className={`px-2 py-1 font-mono text-xs rounded transition-all ${
                  layout === l.id
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CCTV Viewport */}
      <div className="flex-1 min-h-0 w-full flex flex-col font-sans">
        <div className="flex-1 bg-black p-4 overflow-y-auto">
          <div className={`grid gap-4 h-full ${
            layout === 'grid-3x3' 
              ? 'grid-cols-3 grid-rows-3' 
              : layout === 'grid-2x2' 
                ? 'grid-cols-2 grid-rows-2' 
                : 'grid-cols-1 grid-rows-1'
          }`}>
            {activeChannels.map(channel => (
              <div 
                key={channel.id}
                onClick={() => {
                  if (layout !== 'focal') {
                    setFocalCam(channel.id);
                    setLayout('focal');
                  }
                }}
                className={`h-full w-full ${layout !== 'focal' ? 'cursor-pointer hover:border-white/50 transition-all' : ''}`}
              >
                <Feed
                  id={channel.id}
                  name={channel.name}
                  clickable={false}
                  bRadius={true}
                  ladleView="SIM"
                  mode={cvFilter}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-white px-4 py-3 font-mono text-sm flex items-center gap-5 overflow-x-auto whitespace-nowrap">
          {getCVEvents().slice(0, 1).map(e => (
            <React.Fragment key={e.id}>
              <strong>TRACKING DEVIATIONS</strong>
              <span className="text-slate-400">Active edge sensor incident telemetry</span>
              <strong>{e.severity}</strong>
              <span>{e.time}</span>
              <strong>{e.label}</strong>
              <span className="text-slate-400">{e.details}</span>
            </React.Fragment>
          ))}
          <span>LATENCY: <strong>12.5 ms</strong></span>
          <span>HARDWARE: <strong>ESP32 Edge Node</strong></span>
          <span>CONNECTION: <strong>Modbus over TCP/IP</strong></span>
        </div>
      </div>
    </div>
  );
}
