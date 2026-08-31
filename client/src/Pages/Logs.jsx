import React, { useState } from 'react';
import downloadIcon from '../Assets/download.png';
import { useSimulation } from '../context/SimulationContext';

export default function Logs() {
  const { alerts } = useSimulation();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filter logs
  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || a.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSeverity && matchesCategory;
  });

  // Export alerts to CSV
  const handleExportCSV = () => {
    if (alerts.length === 0) return;
    
    // Header
    let csvContent = 'data:text/csv;charset=utf-8,ID,Timestamp,Category,Severity,Message,Location\n';
    
    // Rows
    alerts.forEach(a => {
      const msg = a.message.replace(/"/g, '""'); // Escape double quotes
      csvContent += `${a.id},"${a.timestamp}","${a.category}","${a.severity}","${msg}","${a.location}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Alarms_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityStyle = (sev) => {
    if (sev === 'CRITICAL') return 'bg-red-500/15 text-red-400 border-red-900/40 font-bold';
    if (sev === 'HIGH') return 'bg-amber-500/15 text-amber-400 border-amber-900/40 font-semibold';
    if (sev === 'MEDIUM') return 'bg-yellow-500/10 text-yellow-300 border-yellow-850/30';
    if (sev === 'LOW') return 'bg-blue-500/10 text-blue-300 border-blue-800/30';
    return 'bg-slate-900 text-slate-500 border-slate-800';
  };

  return (
    <div className="h-[100vh] w-full flex flex-col bg-black text-white font-pixel">
      {/* Header */}
      <div className="px-6 py-4 bg-black border-b-2 border-slate-800 flex justify-between items-center shrink-0 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white uppercase">
            [EVENT LOGS MONITORING]
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Incident stream • edge system compliance audits
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-6 py-2.5 bg-black border-b-2 border-slate-800 flex gap-4 text-xs font-mono items-center flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                severityFilter === s
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">CATEGORY:</span>
          {['ALL', 'Tracking', 'Heat Leak', 'Flow', 'Safety Compliance', 'Maintenance', 'Sensor'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                categoryFilter.toLowerCase() === c.toLowerCase()
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Viewport */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto p-6 space-y-2 bg-black font-sans relative">
        {filteredAlerts.length === 0 ? (
          <div className="text-center text-slate-600 font-mono text-xs py-12">
            No logged events match the selected filters.
          </div>
        ) : (
          filteredAlerts.map(log => (
            <div 
              key={log.id}
              className={`flex items-center gap-4 p-2.5 border rounded border-slate-900 text-xs font-mono bg-black`}
            >
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${getSeverityStyle(log.severity)}`}>
                {log.severity}
              </span>
              <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
              <span className="text-amber-500 font-semibold uppercase shrink-0 text-[10px]">
                {log.category}
              </span>
              <p className="text-slate-200 flex-1 min-w-0 truncate">{log.message}</p>
              <span className="text-[10px] bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.2 rounded shrink-0">
                LOC: {log.location}
              </span>
            </div>
          ))
        )}

        {/* Download CSV button exactly matching bottom right pill mockup */}
        <div 
          onClick={handleExportCSV}
          className="h-[50px] w-[170px] cursor-pointer rounded-full bg-white text-black font-bold flex justify-around items-center p-2 absolute bottom-[4%] right-[4%] shadow-lg hover:bg-slate-200 z-50 font-sans"
        >
          <h1 className="font-bold text-sm">Download</h1>
          <img src={downloadIcon} alt="Download" className="w-[30px] h-[30px]" />
        </div>
      </div>
    </div>
  );
}
