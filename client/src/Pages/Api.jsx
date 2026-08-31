import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
const RESOURCES = ['ladles', 'telemetry', 'alerts', 'work-orders'];

export default function Api() {
  const location = useLocation();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const resource = location.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const endpoint = useMemo(
    () => `${API_BASE}/api${resource ? `/${resource}` : ''}${location.search}`,
    [resource, location.search]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || `REST request failed (${response.status})`);
        if (active) {
          setPayload(body);
          setError('');
          setUpdatedAt(new Date());
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };

    load();
    const timer = window.setInterval(load, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [endpoint]);

  return (
    <main className="min-h-full bg-black text-white p-6 font-mono">
      <header className="border-b-2 border-white pb-4 mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">LIVE REST EXPLORER</p>
          <h1 className="text-3xl font-bold tracking-tight">Forgeye API</h1>
        </div>
        <div className="text-right text-sm text-slate-400">
          <div>GET {endpoint}</div>
          <div>{updatedAt ? `UPDATED ${updatedAt.toLocaleTimeString()}` : 'CONNECTING'}</div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-5">
        <Link to="/api" className="border border-white px-3 py-2 text-sm hover:bg-white hover:text-black">ROOT</Link>
        {RESOURCES.map(item => (
          <Link key={item} to={`/api/${item}`} className="border border-slate-600 px-3 py-2 text-sm hover:bg-white hover:text-black">
            {item.toUpperCase()}
          </Link>
        ))}
      </nav>

      <section className="border border-slate-600 bg-[#080808] p-5 text-base leading-relaxed overflow-auto min-h-[60vh]">
        {error ? (
          <div>
            <strong>REST CONNECTION ERROR</strong>
            <p className="text-slate-400 mt-2">{error}</p>
            <p className="text-slate-500 mt-4">The deployment API is unavailable. Check the Vercel Function logs and environment configuration.</p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(payload, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}
