import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Dashboard' },
    { path: '/lts', name: 'LTS' },
    { path: '/redspot', name: 'Redspot' },
    { path: '/camera', name: 'Camera' },
    { path: '/logs', name: 'Logs' },
    { path: '/rhombo', name: 'Rhomboidity' },
    { path: '/api', name: 'APIs' }
  ];

  return (
    <nav className="h-[100vh] w-[220px] bg-black border-r-2 border-slate-800 flex flex-col p-4 shrink-0 font-sans">
      {/* Sidebar Header */}
      <div className="mb-8 mt-2 text-center">
        <h1 className="text-white text-3xl font-bold tracking-widest font-mono">
          FORGEYE
        </h1>
        <div className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold mt-1.5">
          Vizag Steel Plant
        </div>
      </div>
      
      {/* Menu Links */}
      <ul className="space-y-3 text-sm">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block py-3 px-3 transition-all font-semibold text-base ${
                  isActive
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
