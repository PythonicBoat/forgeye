import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

export default function TabularData() {
  const { ladles, activeLadleId, setActiveLadleId } = useSimulation();
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('ladleId');
  const [searchQuery, setSearchQuery] = useState('');

  const activeLadle = ladles.find(l => l.ladleId === activeLadleId) || ladles[0] || {
    ladleId: 'LAD-1001',
    location: 'BF1',
    status: 'EMPTY',
    capacity: 150,
    previousLocation: 'SCRAP',
    travelDistance: 0,
    heatRetention: 95,
    lastMaintenance: '2026-06-01',
    routeHistory: ['SCRAP'],
    refractoryHealth: 100
  };

  // Filter and sort ladles
  const filteredLadles = ladles
    .filter(l => {
      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchesSearch = l.ladleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortField === 'ladleId') {
        return a.ladleId.localeCompare(b.ladleId);
      }
      if (sortField === 'currentTemperature') {
        return b.currentTemperature - a.currentTemperature;
      }
      if (sortField === 'refractoryHealth') {
        return a.refractoryHealth - b.refractoryHealth;
      }
      if (sortField === 'cyclesCompleted') {
        return b.cyclesCompleted - a.cyclesCompleted;
      }
      return 0;
    });

  const getStatusBadge = (status) => {
    let style = 'bg-black text-slate-400 border-white/40';
    if (status === 'FULL') style = 'bg-red-950/20 text-red-400 border-red-900/40';
    else if (status === 'EMPTY') style = 'bg-slate-900 text-slate-400 border-slate-700/40';
    else if (status === 'TRANSIT') style = 'bg-blue-950/20 text-blue-400 border-blue-900/40';
    else if (status === 'MAINTENANCE') style = 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40';
    else if (status === 'HEATING') style = 'bg-amber-950/20 text-amber-400 border-amber-900/40';
    
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 min-h-[500px] bg-black text-white font-mono">
      
      {/* Left Column: Ladle Datagrid */}
      <div className="col-span-12 xl:col-span-8 bg-black border-2 border-white rounded-xl p-4 flex flex-col justify-between">
        <div>
          {/* Header & Filters */}
          <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-wider text-white font-pixel">
                Ladle Registry Directory
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">
                Asset location, metallurgical weights & cycles completed
              </p>
            </div>

            {/* Grid Search & Filter Bars */}
            <div className="flex gap-2 flex-wrap items-center">
              <input
                type="text"
                placeholder="Search Ladle/Loc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border border-white/60 px-2.5 py-1 rounded text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-yellow-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-white/60 px-2 py-1 rounded text-xs font-mono text-slate-300"
              >
                <option value="ALL">ALL STATES</option>
                <option value="FULL">FULL</option>
                <option value="EMPTY">EMPTY</option>
                <option value="TRANSIT">TRANSIT</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="bg-black border border-white/60 px-2 py-1 rounded text-xs font-mono text-slate-300"
              >
                <option value="ladleId">SORT BY ID</option>
                <option value="currentTemperature">TEMP (HOTTEST)</option>
                <option value="refractoryHealth">HEALTH (LOWEST)</option>
                <option value="cyclesCompleted">CYCLES COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Datagrid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-left">
                  <th className="py-2 pr-2">LADLE ID</th>
                  <th className="py-2 px-2">LOCATION</th>
                  <th className="py-2 px-2">STATUS</th>
                  <th className="py-2 px-2 text-right">TEMP</th>
                  <th className="py-2 px-2 text-right">METAL (T)</th>
                  <th className="py-2 px-2 text-right">SLAG (T)</th>
                  <th className="py-2 px-2 text-right">HEALTH</th>
                  <th className="py-2 pl-2 text-right">CYCLES</th>
                </tr>
              </thead>
              <tbody>
                {filteredLadles.map(item => {
                  const isSelected = activeLadleId === item.ladleId;
                  const isCritical = item.refractoryHealth < 80;
                  
                  return (
                    <tr 
                      key={item.ladleId} 
                      onClick={() => setActiveLadleId(item.ladleId)}
                      className={`border-b border-slate-900/60 hover:bg-slate-900/40 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-yellow-500/5 text-yellow-500 font-semibold' 
                          : isCritical 
                            ? 'bg-red-950/10 text-red-200' 
                            : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 pr-2 font-bold flex items-center gap-1.5">
                        {isCritical && (
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                        )}
                        {item.ladleId}
                      </td>
                      <td className="py-2.5 px-2">{item.location}</td>
                      <td className="py-2.5 px-2">{getStatusBadge(item.status)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-yellow-500">{item.currentTemperature}°C</td>
                      <td className="py-2.5 px-2 text-right">{item.materialWeight} T</td>
                      <td className="py-2.5 px-2 text-right text-slate-500">{item.slagWeight} T</td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={isCritical ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                          {Math.floor(item.refractoryHealth)}%
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right">{item.cyclesCompleted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Footer */}
        <div className="border-t border-slate-900/60 pt-3 mt-4 text-[9px] font-mono text-slate-500 flex justify-between">
          <span>ACTIVE TEAMS: SMS-1 / SMS-2</span>
          <span>SHOWN: {filteredLadles.length} / 10 UNITS</span>
        </div>
      </div>

      {/* Right Column: Ladle Inspector Panel */}
      <div className="col-span-12 xl:col-span-4 bg-black border-2 border-white rounded-xl p-4 flex flex-col justify-between min-h-[480px]">
        <div>
          <h2 className="text-xl font-bold font-mono text-white tracking-wider font-pixel">
            Unit Detail Inspector
          </h2>
          <span className="text-xl font-bold font-mono text-yellow-500 mt-1 block">
            {activeLadle.ladleId}
          </span>
          
          {/* Detailed Statistics */}
          <div className="space-y-4 mt-5 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border border-slate-900 p-2.5 rounded">
                <span className="text-[9px] text-slate-500 block">CURRENT STATE</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{activeLadle.status}</span>
              </div>
              <div className="bg-black border border-slate-900 p-2.5 rounded">
                <span className="text-[9px] text-slate-500 block">CAPACITY</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{activeLadle.capacity} Tons</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-900/60 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Station:</span>
                <span className="text-slate-300">{activeLadle.previousLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Distance:</span>
                <span className="text-slate-300">{activeLadle.travelDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heat Retention:</span>
                <span className="text-slate-300">{(activeLadle.heatRetention || 95).toFixed(1)}% efficiency</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Inspection:</span>
                <span className="text-slate-300">{activeLadle.lastMaintenance}</span>
              </div>
            </div>

            {/* Route Sequence Progress */}
            <div className="border-t border-slate-900/60 pt-3">
              <span className="text-[9px] text-slate-500 block uppercase mb-1.5">ROUTE LOG SEQUENCE</span>
              <div className="flex flex-wrap items-center gap-1">
                {(activeLadle.routeHistory || []).map((node, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-slate-700 text-[10px]">&rarr;</span>}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      index === (activeLadle.routeHistory || []).length - 1
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40'
                        : 'bg-slate-900 text-slate-500'
                    }`}>
                      {node}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Indicator */}
        <div className="bg-black border border-slate-900 rounded p-3 text-[10px] font-mono leading-relaxed mt-4">
          {(activeLadle.refractoryHealth || 100) < 80 ? (
            <div className="flex items-start gap-2 text-red-400">
              <span className="text-lg font-bold leading-none">&#9888;</span>
              <div>
                <p className="font-bold">CRITICAL WEAR ALERT</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Vessel lining wear indicates immediate relining shutdown required.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-emerald-500">
              <span className="text-lg font-bold leading-none">&#10003;</span>
              <div>
                <p className="font-bold">UNIT STABLE</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Refractory thickness is within safety margins.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}