import React from 'react';
import Feed from '../Components/Feed';
import { useSimulation } from '../context/SimulationContext';

export default function Redspot() {
  const { 
    ladles, 
    activeLadleId, 
    setActiveLadleId
  } = useSimulation();

  const activeLadle = ladles.find(l => l.ladleId === activeLadleId) || ladles[0];

  // Filter ladles that are currently holding molten steel (hot operations)
  const hotLadles = ladles.filter(l => 
    l.location.startsWith('BF') || 
    l.location === 'BOF' || 
    l.location.startsWith('LF') || 
    l.location === 'RH' || 
    l.location.startsWith('CC')
  );

  const getSeverityColor = (severity) => {
    if (severity === 'CRITICAL') return 'text-red-500 font-bold';
    if (severity === 'HIGH') return 'text-amber-500 font-semibold';
    if (severity === 'MEDIUM') return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="h-[100vh] w-full flex flex-col bg-black text-white">
      
      {/* Header */}
      <div className="px-6 py-4 bg-black border-b border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">
            THERMAL HOTSPOT & HEAT LEAK INTELLIGENCE
          </h1>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Infrared shell temperature interface, hotspot bounding boxes & heat loss estimates
          </p>
        </div>

        {/* Selected Ladle Indicator */}
        <div className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-amber-500 font-bold">
          INSPECTING: {activeLadle?.ladleId}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 w-full p-4 overflow-y-auto grid grid-cols-12 gap-4">
        
        {/* Left Section: Focal IR Cam & Diagnostics */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
          
          {/* Focal IR Camera Feed */}
          <div className="h-[380px] bg-black border border-slate-800 rounded-xl overflow-hidden shadow-lg relative flex flex-col justify-between">
            <div className="absolute top-4 left-4 p-2 bg-red-950/80 border border-red-900/60 text-red-400 font-mono text-[9px] font-bold tracking-wider uppercase z-30 rounded animate-pulse">
              [IR THERMOVISION CAPTURE]
            </div>

            <div className="flex-1 w-full relative">
              {activeLadle && (
                <Feed
                  id={activeLadle.location}
                  name="Thermal Scan Bay"
                  clickable={false}
                  bRadius={false}
                  ladleView={activeLadle.ladleId}
                  mode="THERMAL"
                  fit="contain"
                />
              )}
            </div>
          </div>

          {/* Hotspot Diagnostics Dashboard */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Hotspot Area</span>
              <span className="text-xl font-bold font-mono text-amber-500 block mt-1">
                {activeLadle?.hotspotDetected ? `${activeLadle.hotspotSize.toFixed(2)} m²` : '0.00 m²'}
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">IR pixel segmentation size</span>
            </div>
            
            <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Temperature Delta</span>
              <span className="text-xl font-bold font-mono text-red-500 block mt-1">
                {activeLadle?.hotspotDetected ? `+${activeLadle.hotspotDelta} °C` : '+0 °C'}
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">Shell vs hotspot difference</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Estimated Energy Loss</span>
              <span className="text-xl font-bold font-mono text-slate-200 block mt-1">
                {activeLadle?.hotspotDetected ? `${(activeLadle.hotspotSize * 4).toFixed(1)} MW` : '0.0 MW'}
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">Heat escape vector rate</span>
            </div>
          </div>
        </div>

        {/* Right Section: Active Shell Monitor & Controls */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          
          {/* Active Shell Temperature Directory */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 flex-1 flex flex-col justify-between min-h-[300px]">
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-slate-300 uppercase mb-3">
                Shell Temperature Directory
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-left">
                      <th className="py-2 pr-2">LADLE ID</th>
                      <th className="py-2 px-2">LOCATION</th>
                      <th className="py-2 px-2 text-right">SHELL T</th>
                      <th className="py-2 px-2 text-right">SEVERITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotLadles.map(hl => {
                      const isSelected = activeLadleId === hl.ladleId;
                      const shellTemp = hl.currentTemperature * 0.22 + (hl.hotspotDetected ? hl.hotspotDelta : 0) + 5;
                      
                      return (
                        <tr 
                          key={hl.ladleId} 
                          onClick={() => setActiveLadleId(hl.ladleId)}
                          className={`border-b border-slate-900/60 hover:bg-slate-800/10 cursor-pointer text-slate-300 ${
                            isSelected ? 'bg-amber-500/5 text-amber-400 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 pr-2 font-bold">{hl.ladleId}</td>
                          <td className="py-2.5 px-2">{hl.location}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-slate-200">
                            {Math.round(shellTemp)}°C
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span className={getSeverityColor(hl.hotspotSeverity)}>
                              {hl.hotspotSeverity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-4 text-[9px] font-mono text-slate-500 flex justify-between">
              <span>SCANNER: SMS-IR-CAM-A</span>
              <span>CALIBRATION: STABLE</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
