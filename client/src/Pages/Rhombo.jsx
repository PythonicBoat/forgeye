import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

const REFRACTORY_ZONES = [
  { id: 'slagLine', name: 'Slag Line Area', baseThickness: 350 },
  { id: 'upperWall', name: 'Upper Side Wall', baseThickness: 300 },
  { id: 'lowerWall', name: 'Lower Side Wall', baseThickness: 300 },
  { id: 'bottom', name: 'Ladle Bottom Pad', baseThickness: 400 }
];

export default function Rhombo() {
  const { 
    ladles, 
    activeLadleId, 
    setActiveLadleId, 
    workOrders, 
    repairLadle 
  } = useSimulation();

  const [selectedCalc, setSelectedCalc] = useState('Standard Regression');

  const activeLadle = ladles.find(l => l.ladleId === activeLadleId) || ladles[0] || {
    ladleId: 'LAD-1001',
    refractoryHealth: 100,
    currentTemperature: 1200,
    materialWeight: 0,
    slagWeight: 0,
    status: 'EMPTY'
  };

  const getZoneStats = (zoneId, health) => {
    let multiplier = 1;
    if (zoneId === 'slagLine') multiplier = 1.15;
    if (zoneId === 'bottom') multiplier = 0.9;

    const healthFraction = (health || 100) / 100;
    const wearPercentage = (1 - healthFraction) * 100 * multiplier;
    
    const zone = REFRACTORY_ZONES.find(z => z.id === zoneId);
    const thickness = Math.max(50, Math.round(zone.baseThickness * (healthFraction * (2 - healthFraction) * 0.9 + 0.1)));
    
    let status = 'STABLE';
    let color = '#ffffff'; // White for stable
    if (thickness < 150) {
      status = 'CRITICAL';
      color = '#ef4444'; // Red
    } else if (thickness < 220) {
      status = 'WEAR';
      color = '#eab308'; // Yellow
    }

    return {
      name: zone.name,
      thickness: `${thickness} mm`,
      baseThickness: `${zone.baseThickness} mm`,
      wearPercent: `${Math.min(95, Math.round(wearPercentage))}%`,
      status,
      color
    };
  };

  const getRULPrediction = (l) => {
    const health = l.refractoryHealth || 100;
    const remainingCycles = Math.round(health * 1.5);
    const remainingDays = parseFloat((remainingCycles * 2.8 / 24).toFixed(1));
    const isLeaking = l.hotspotDetected;
    const crackRisk = isLeaking ? 95 : Math.round(20 + (100 - health) * 0.6);

    return {
      remainingCycles,
      remainingDays,
      crackRisk: `${crackRisk}%`,
      failureProbability: `${Math.round(100 - health)}%`
    };
  };

  const predictions = getRULPrediction(activeLadle);

  const handleRepair = (lId) => {
    repairLadle(lId);
  };

  // SVG Calculations for dynamic bricks wear
  const healthRatio = (activeLadle.refractoryHealth || 100) / 100;
  const brickWidth = Math.max(4, Math.round(18 * healthRatio)); // Dynamic brick thickness

  return (
    <div className="h-[100vh] w-full flex flex-col bg-black text-white font-sans">
      {/* Header */}
      <div className="px-6 py-4 bg-black border-b-2 border-slate-800 flex justify-between items-center shrink-0 font-pixel">
        <div>
          <h1 className="text-3xl font-bold tracking-wider text-white">
            [REFRACTORY DEGRADATION ANALYSIS]
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Lining thickness calculations & statistical wear remaining estimates
          </p>
        </div>

        {/* Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">SELECT UNIT:</label>
          <select
            value={activeLadleId}
            onChange={(e) => setActiveLadleId(e.target.value)}
            className="bg-black border border-slate-800 p-1.5 rounded text-xs font-mono text-slate-200"
          >
            {ladles.map(l => (
              <option key={l.ladleId} value={l.ladleId}>{l.ladleId}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 w-full p-4 overflow-y-auto grid grid-cols-12 gap-4 bg-black">
        
        {/* Left Column: Dynamic Vessel Linear Diagram SVG */}
        <div className="col-span-12 lg:col-span-5 bg-black border-2 border-white rounded-xl p-4 flex flex-col justify-between min-h-[420px]">
          <div>
            <h2 className="text-lg font-bold text-slate-200 uppercase font-mono">
              Vessel Linear Diagram
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Live wall lining thickness profile ({activeLadle?.ladleId})
            </p>
          </div>

          {/* SVG Ladle Relining Visualizer */}
          <div className="flex-1 flex justify-center items-center py-4 bg-black">
            <svg viewBox="0 0 260 280" className="w-full max-h-[260px]">
              {/* Outer Steel Shell (White outline) */}
              <path
                d="M 50 30 L 65 230 L 195 230 L 210 30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Safety Lining Backing (Slate) */}
              <path
                d="M 56 32 L 70 224 L 190 224 L 204 32"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dynamic Working Lining Bricks (Erodes in width in real-time) */}
              {/* Left Wall Bricks */}
              <path
                d={`M ${56 + brickWidth} 32 L ${70 + brickWidth} 220`}
                fill="none"
                stroke={activeLadle.refractoryHealth < 80 ? '#ef4444' : '#eab308'}
                strokeWidth={brickWidth}
                strokeLinecap="round"
              />

              {/* Right Wall Bricks */}
              <path
                d={`M ${204 - brickWidth} 32 L ${190 - brickWidth} 220`}
                fill="none"
                stroke={activeLadle.refractoryHealth < 80 ? '#ef4444' : '#eab308'}
                strokeWidth={brickWidth}
                strokeLinecap="round"
              />

              {/* Bottom Impact Bricks */}
              <path
                d="M 74 220 L 186 220"
                fill="none"
                stroke={activeLadle.refractoryHealth < 80 ? '#ef4444' : '#ffffff'}
                strokeWidth={Math.max(3, Math.round(10 * healthRatio))}
                strokeLinecap="round"
              />

              {/* Molten Metal Core inside vessel if filled */}
              {activeLadle?.materialWeight > 0 && (
                <path
                  d={`M ${70 + brickWidth + 4} 110 L ${74 + brickWidth + 4} 210 L ${186 - brickWidth - 4} 210 L ${190 - brickWidth - 4} 110 Z`}
                  fill="#ea580c"
                  opacity="0.8"
                  className="animate-pulse"
                />
              )}

              {/* Shell Hotspot graphic overlay if heat leak is present */}
              {activeLadle?.hotspotDetected && (
                <g>
                  <circle cx="206" cy="120" r="14" fill="#ef4444" opacity="0.4" className="animate-ping"/>
                  <circle cx="206" cy="120" r="5" fill="#ef4444"/>
                </g>
              )}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-900 pt-3 text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#ffffff] rounded-sm"></span>
              <span>Lining Bricks (Stable)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#eab308] rounded-sm"></span>
              <span>Lining Bricks (Eroded/Wear)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Work Orders */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 text-base">
          
          <div className="bg-black border-2 border-white rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold font-mono text-slate-200">
                  Statistical Remaining Useful Life
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Regression indicators & degradation calculators
                </p>
              </div>

              <div className="flex bg-slate-900 p-1 rounded border border-slate-800 text-[10px] font-mono">
                {['Standard Regression', 'Cycle wear rate'].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedCalc(m)}
                    className={`px-2.5 py-1 rounded transition-all ${
                      selectedCalc === m
                        ? 'bg-white text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-slate-950 border border-slate-900 p-3 rounded">
                <span className="text-xs text-slate-500 font-mono block">RUL Cycles</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {predictions.remainingCycles} heats
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-3 rounded">
                <span className="text-xs text-slate-500 font-mono block">RUL Days</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {predictions.remainingDays} days
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-3 rounded">
                <span className="text-xs text-slate-500 font-mono block">Crack Risk</span>
                <span className="text-xl font-bold font-mono text-red-500 mt-1 block">
                  {predictions.crackRisk}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-3 rounded">
                <span className="text-xs text-slate-500 font-mono block">Relining Trigger</span>
                <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">
                  {predictions.failureProbability}
                </span>
              </div>
            </div>

            {/* Thickness Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase">
                Lining Thickness Breakdown
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {REFRACTORY_ZONES.map(z => {
                  const stats = getZoneStats(z.id, activeLadle?.refractoryHealth);
                  return (
                    <div 
                      key={z.id}
                      className="bg-black border border-slate-900 p-2.5 rounded flex justify-between items-center font-mono"
                    >
                      <div>
                        <span className="text-slate-300 block">{stats.name}</span>
                        <span className="text-[10px] text-slate-500 block">Base: {stats.baseThickness}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block" style={{ color: stats.color === '#ffffff' ? '#ffffff' : stats.color }}>{stats.thickness}</span>
                        <span className="text-[10px] text-slate-400 block">Worn: {stats.wearPercent}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Maintenance Work Orders */}
          <div className="bg-black border-2 border-white rounded-xl p-4 flex flex-col justify-between min-h-[260px] h-[280px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold font-mono text-slate-200">
                  Refractory Maintenance Log
                </h2>
                
                <button
                  onClick={() => handleRepair(activeLadle?.ladleId)}
                  className="px-3 py-1 bg-white hover:bg-slate-200 text-black font-bold text-xs font-mono rounded transition-all shadow-md"
                >
                  RELINE VESSEL / RESET
                </button>
              </div>

              {/* Scrollable table container */}
              <div className="overflow-y-auto max-h-[160px] border border-slate-900 rounded p-1.5 bg-slate-950/40">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-left">
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 px-2">Ladle</th>
                      <th className="py-2 px-2">Issue</th>
                      <th className="py-2 px-2">Priority</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 pl-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">
                          No active relining logs. All units stable.
                        </td>
                      </tr>
                    ) : (
                      workOrders.map(wo => (
                        <tr key={wo.id} className="border-b border-slate-900 hover:bg-slate-950/20 text-slate-300">
                          <td className="py-2 pr-2 text-slate-400 font-bold">{wo.id}</td>
                          <td className="py-2 px-2 text-amber-500 font-bold">{wo.ladleId}</td>
                          <td className="py-2 px-2">{wo.issue}</td>
                          <td className="py-2 px-2">
                            <span className="text-[10px] font-bold text-red-400">
                              {wo.priority}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-400">{wo.assignedTeam}</td>
                          <td className="py-2 pl-2 font-bold">
                            {wo.status === 'COMPLETED' ? (
                              <span className="text-emerald-500">COMPLETE</span>
                            ) : (
                              <button
                                onClick={() => handleRepair(wo.ladleId)}
                                className="text-yellow-500 hover:text-yellow-400 font-semibold underline text-[10px]"
                              >
                                EXECUTE
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
