import React from 'react';
import { useSimulation } from '../context/SimulationContext';

export default function SankeyFlow() {
  const { ladles } = useSimulation();

  // Define layout coordinates for our Sankey Flow Map
  const NODES = {
    BF: { label: 'Blast Furnaces', x: 50, y: 70, color: '#f97316' },
    BOF: { label: 'BOF Converter', x: 180, y: 70, color: '#ef4444' },
    LF: { label: 'Ladle Furnace', x: 310, y: 70, color: '#eab308' },
    RH: { label: 'RH Degasser', x: 440, y: 70, color: '#ec4899' },
    CC: { label: 'Continuous Caster', x: 570, y: 70, color: '#3b82f6' },
    SLAG: { label: 'Slag Pit', x: 700, y: 110, color: '#78350f' },
    MAINT: { label: 'Maintenance', x: 310, y: 160, color: '#10b981' },
    PREHEAT: { label: 'Preheaters', x: 440, y: 160, color: '#f59e0b' }
  };

  const FLOWS = [
    { from: 'BF', to: 'BOF', color: '#ea580c' },
    { from: 'BOF', to: 'LF', color: '#dc2626' },
    { from: 'LF', to: 'RH', color: '#ca8a04' },
    { from: 'RH', to: 'CC', color: '#db2777' },
    { from: 'CC', to: 'SLAG', color: '#2563eb' },
    
    // Empty cycles / maintenance
    { from: 'SLAG', to: 'MAINT', color: '#4b5563' },
    { from: 'SLAG', to: 'PREHEAT', color: '#4b5563' },
    { from: 'MAINT', to: 'PREHEAT', color: '#10b981' },
    { from: 'PREHEAT', to: 'BF', color: '#f59e0b' }
  ];

  // Helper to count active ladles in each zone grouping
  const getGroupCount = (groupKey) => {
    return ladles.filter(l => {
      const loc = l.location;
      if (groupKey === 'BF') return loc.startsWith('BF');
      if (groupKey === 'LF') return loc.startsWith('LF');
      if (groupKey === 'CC') return loc.startsWith('CC');
      return loc === groupKey;
    }).length;
  };

  // Check if a station group is experiencing bottlenecks (average delay is high)
  const isBottleneck = (groupKey) => {
    const groupLadles = ladles.filter(l => {
      const loc = l.location;
      if (groupKey === 'BF') return loc.startsWith('BF');
      if (groupKey === 'LF') return loc.startsWith('LF');
      if (groupKey === 'CC') return loc.startsWith('CC');
      return loc === groupKey;
    });

    // If any ladle in group has been at station > 12 ticks, it's a bottleneck
    return groupLadles.some(l => l.status !== 'TRANSIT' && l.timeInState > 11);
  };

  return (
    <div className="w-full bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase">
            Ladle Routing & Flow Bottlenecks
          </h3>
          <p className="text-[9px] text-slate-500 font-mono">
            Process nodes volume & active cycle paths
          </p>
        </div>
        
        <div className="flex gap-4 text-[9px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            <span>BOTTLENECK DETECTED</span>
          </div>
        </div>
      </div>

      <div className="relative w-full flex justify-center items-center">
        <svg
          viewBox="0 0 760 210"
          className="w-full h-auto select-none font-mono"
        >
          {/* Defs for gradients, glowing filters */}
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5"/>
            </filter>
          </defs>

          {/* 1. Draw Flow Connections */}
          {FLOWS.map((flow, idx) => {
            const start = NODES[flow.from];
            const end = NODES[flow.to];
            
            // Draw smooth bezier curves
            const pathData = flow.from === 'SLAG' || flow.to === 'BF'
              ? `M ${start.x} ${start.y} C ${(start.x + end.x)/2} ${start.y}, ${(start.x + end.x)/2} ${end.y}, ${end.x} ${end.y}`
              : `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

            const count = getGroupCount(flow.from);
            const activeTransit = ladles.some(l => 
              l.status === 'TRANSIT' && 
              ((l.previousLocation.startsWith(flow.from) && l.location.startsWith(flow.to)) ||
               (l.previousLocation === flow.from && l.location === flow.to))
            );

            return (
              <g key={`flow-${idx}`}>
                {/* Thick background flow line representing volume capacity */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={flow.color}
                  strokeWidth={count > 0 ? 3.5 + count * 1.5 : 2}
                  opacity={count > 0 ? 0.35 : 0.15}
                  strokeLinecap="round"
                />

                {/* Animated dash line overlay when transit is active */}
                {activeTransit && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    className="animate-[dash_2s_linear_infinite]"
                    style={{
                      strokeDashoffset: 100
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* 2. Draw Nodes */}
          {Object.entries(NODES).map(([key, node]) => {
            const count = getGroupCount(key);
            const bottleneck = isBottleneck(key);
            
            return (
              <g
                key={key}
                transform={`translate(${node.x}, ${node.y})`}
                filter="url(#shadow)"
              >
                {/* Node Box */}
                <rect
                  x="-45"
                  y="-16"
                  width="90"
                  height="32"
                  rx="6"
                  fill={bottleneck ? 'rgba(239, 68, 68, 0.1)' : '#0f172a'}
                  stroke={bottleneck ? '#ef4444' : count > 0 ? node.color : '#334155'}
                  strokeWidth="1.5"
                  className={bottleneck ? 'animate-pulse' : ''}
                />

                {/* Active Ladle Counter Badge */}
                {count > 0 && (
                  <circle
                    cx="40"
                    cy="-14"
                    r="8.5"
                    fill={bottleneck ? '#ef4444' : node.color}
                  />
                )}
                {count > 0 && (
                  <text
                    x="40"
                    y="-11"
                    textAnchor="middle"
                    fill="#0f172a"
                    className="text-[8px] font-bold"
                  >
                    {count}
                  </text>
                )}

                {/* Station Label */}
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fill={bottleneck ? '#ef4444' : '#f8fafc'}
                  className="text-[8px] font-bold tracking-wider"
                >
                  {key}
                </text>

                {/* Subtitle count/status */}
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fill={bottleneck ? '#ef4444' : '#64748b'}
                  className="text-[6px] font-semibold tracking-wide"
                >
                  {bottleneck ? 'DELAY DETECTED' : count > 0 ? `${count} ACTIVE` : 'VACANT'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
}
