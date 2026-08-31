import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

const STATIONS = {
  SCRAP: { id: 'SCRAP', name: 'Scrap Yard', x: 80, y: 200, color: '#94a3b8', label: 'SCRAP' },
  BF1: { id: 'BF1', name: 'Blast Furnace 1', x: 230, y: 110, color: '#f57c00', label: 'BF-1' },
  BF2: { id: 'BF2', name: 'Blast Furnace 2', x: 230, y: 290, color: '#f57c00', label: 'BF-2' },
  BOF: { id: 'BOF', name: 'BOF Converter', x: 390, y: 200, color: '#d32f2f', label: 'BOF' },
  LF1: { id: 'LF1', name: 'Ladle Furnace 1', x: 550, y: 110, color: '#fbc02d', label: 'LF-1' },
  LF2: { id: 'LF2', name: 'Ladle Furnace 2', x: 550, y: 290, color: '#fbc02d', label: 'LF-2' },
  RH: { id: 'RH', name: 'RH Degasser', x: 690, y: 200, color: '#7b1fa2', label: 'RH' },
  CC1: { id: 'CC1', name: 'Continuous Caster 1', x: 830, y: 110, color: '#1976d2', label: 'CC-1' },
  CC2: { id: 'CC2', name: 'Continuous Caster 2', x: 830, y: 290, color: '#1976d2', label: 'CC-2' },
  SLAG: { id: 'SLAG', name: 'Slag Dump', x: 930, y: 200, color: '#5d4037', label: 'SLAG' },
  MAINT: { id: 'MAINT', name: 'Maintenance Stand', x: 390, y: 360, color: '#388e3c', label: 'MAINT' },
  PREHEAT: { id: 'PREHEAT', name: 'Preheaters', x: 550, y: 360, color: '#fbc02d', label: 'PREHEAT' }
};

const RAILS = [
  { from: 'SCRAP', to: 'BF1' },
  { from: 'SCRAP', to: 'BF2' },
  { from: 'BF1', to: 'BOF' },
  { from: 'BF2', to: 'BOF' },
  { from: 'BOF', to: 'LF1' },
  { from: 'BOF', to: 'LF2' },
  { from: 'LF1', to: 'RH' },
  { from: 'LF2', to: 'RH' },
  { from: 'RH', to: 'CC1' },
  { from: 'RH', to: 'CC2' },
  { from: 'CC1', to: 'SLAG' },
  { from: 'CC2', to: 'SLAG' },
  { from: 'SLAG', to: 'MAINT' },
  { from: 'SLAG', to: 'PREHEAT' },
  { from: 'MAINT', to: 'PREHEAT' },
  { from: 'PREHEAT', to: 'BF1' },
  { from: 'PREHEAT', to: 'BF2' }
];

export default function Map() {
  const { 
    ladles, 
    activeLadleId, 
    setActiveLadleId, 
    selectedStation, 
    setSelectedStation, 
    manualAnomalies 
  } = useSimulation();

  const [showHeatmap, setShowHeatmap] = useState(false);

  const getLadleColor = (l) => {
    if (l.hotspotDetected) return '#ef4444';
    if (l.status === 'MAINTENANCE') return '#10b981';
    if (l.status === 'HEATING') return '#f59e0b';
    if (l.status === 'EMPTY') return '#64748b';

    const temp = l.currentTemperature;
    const ratio = Math.min(1, Math.max(0, (temp - 1200) / 450));
    const hue = 20 + ratio * 40;
    const lightness = 50 + ratio * 45;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  return (
    <div className="relative col-span-2 row-span-1 bg-black text-white flex flex-col justify-between rounded-xl p-3 border-2 border-white shadow-lg min-h-[380px] font-sans">
      
      {/* Title & Controls */}
      <div className="flex justify-between items-center mb-1 z-10 shrink-0">
        <h1 className="font-pixel text-2xl">Factory Layout</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 text-xs rounded font-semibold border transition-all ${
              showHeatmap
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'bg-black text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            HEATMAP {showHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* SVG Container holding the map image and tracks */}
      <div className="flex-1 w-full bg-black rounded overflow-hidden relative flex justify-center items-center p-1">
        <svg
          viewBox="0 0 1000 420"
          className="w-full h-auto select-none"
        >
          <defs>
            <radialGradient id="mono-heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mono-alert" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Heatmap overlay */}
          {showHeatmap && (
            <>
              {Object.values(STATIONS).map(st => {
                const ladlesAtStation = ladles.filter(l => l.location === st.id && l.status !== 'EMPTY');
                const isHot = st.id.startsWith('BF') || st.id === 'BOF' || st.id.startsWith('LF') || ladlesAtStation.length > 0;
                if (!isHot) return null;
                return (
                  <circle
                    key={`heat-${st.id}`}
                    cx={st.x}
                    cy={st.y}
                    r="100"
                    fill="url(#mono-heat)"
                  />
                );
              })}
            </>
          )}

          {/* 3. Alarm glows */}
          {Object.values(STATIONS).map(st => {
            const hasAlert = 
              (manualAnomalies.ppeViolation && manualAnomalies.ppeViolation === st.id) ||
              (manualAnomalies.gasLeak && manualAnomalies.gasLeak === st.id) ||
              ladles.some(l => l.location === st.id && l.hotspotDetected);

            if (!hasAlert) return null;

            return (
              <circle
                key={`alert-${st.id}`}
                cx={st.x}
                cy={st.y}
                r="50"
                fill="url(#mono-alert)"
                className="animate-pulse"
              />
            );
          })}

          {/* 4. Rail Tracks */}
          <g opacity="0.35">
            {RAILS.map((rail, idx) => {
              const fromNode = STATIONS[rail.from];
              const toNode = STATIONS[rail.to];
              return (
                <line
                  key={`rail-${idx}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />
              );
            })}
          </g>

          {/* 5. Stations */}
          {Object.values(STATIONS).map(st => {
            const isSelected = selectedStation === st.id;
            const hasWarning = 
              (manualAnomalies.ppeViolation && manualAnomalies.ppeViolation === st.id) ||
              (manualAnomalies.gasLeak && manualAnomalies.gasLeak === st.id);

            return (
              <g
                key={st.id}
                transform={`translate(${st.x}, ${st.y})`}
                onClick={() => setSelectedStation(st.id)}
                className="cursor-pointer"
              >
                {/* Outer ring */}
                <circle
                  r={isSelected ? '20' : '16'}
                  fill="none"
                  stroke={hasWarning ? '#ef4444' : isSelected ? '#f59e0b' : '#ffffff'}
                  strokeWidth={isSelected ? '2' : '1'}
                  className={hasWarning ? 'animate-ping' : ''}
                />
                
                {/* Center dot */}
                <circle
                  r="12"
                  fill="#000000"
                  stroke={hasWarning ? '#ef4444' : isSelected ? '#f59e0b' : '#ffffff'}
                  strokeWidth="1.5"
                />

                <circle
                  r="4"
                  fill={hasWarning ? '#ef4444' : isSelected ? '#f59e0b' : '#ffffff'}
                />

                {/* Text label */}
                <text
                  y="-22"
                  textAnchor="middle"
                  fill={hasWarning ? '#ef4444' : isSelected ? '#f59e0b' : '#ffffff'}
                  className="font-pixel text-[13px] font-bold tracking-widest pointer-events-none"
                >
                  {st.label}
                </text>
              </g>
            );
          })}

          {/* 6. Active Ladles following tracks */}
          {ladles.map(l => {
            const isSelected = activeLadleId === l.ladleId;
            const color = getLadleColor(l);

            return (
              <g
                key={l.ladleId}
                transform={`translate(${l.currentCoordinate.x}, ${l.currentCoordinate.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLadleId(l.ladleId);
                  if (STATIONS[l.location]) setSelectedStation(l.location);
                }}
                className="cursor-pointer"
              >
                {l.hotspotDetected && (
                  <circle
                    r="15"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}

                {/* Draw Ladle Mantle shape */}
                <path
                  d="M -8 -6 L 8 -6 L 6 7 L -6 7 Z"
                  fill={color}
                  stroke={isSelected ? '#f59e0b' : '#ffffff'}
                  strokeWidth="1.5"
                />

                {isSelected && (
                  <rect
                    x="-12"
                    y="-12"
                    width="24"
                    height="24"
                    rx="3"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Micro numerical label */}
                <text
                  y="18"
                  textAnchor="middle"
                  fill={isSelected ? '#f59e0b' : '#ffffff'}
                  className="font-pixel text-[11px] font-bold pointer-events-none"
                >
                  L{l.ladleId.replace('LAD-100', '').replace('LAD-10', '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
