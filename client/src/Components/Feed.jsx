import React, { useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import camFeed from '../Assets/cam_feed.mp4';
import arrow from '../Assets/arrow.png';

export default function Feed({ clickable, bRadius, id, name, ladleView, mode = 'ALL', fit = 'cover' }) {
  const { ladles, manualAnomalies } = useSimulation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Active ladle at this station
  const ladleAtStation = ladles.find(l => l.location === id || name.includes(l.location) || l.location.includes(id));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const drawCVOverlay = () => {
      if (!canvas || !videoRef.current) return;
      
      const rect = videoRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animationId = requestAnimationFrame(drawCVOverlay);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const jitter = (val, range = 1.5) => val + (Math.random() * range - range / 2);

      const isThermalMode = mode === 'THERMAL' || (ladleAtStation && ladleAtStation.hotspotDetected);
      if (isThermalMode) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 20, h / 2); ctx.lineTo(w / 2 + 20, h / 2);
        ctx.moveTo(w / 2, h / 2 - 20); ctx.lineTo(w / 2, h / 2 + 20);
        ctx.rect(15, 15, 20, 20);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, 10); ctx.lineTo(25, 10); ctx.moveTo(10, 10); ctx.lineTo(10, 25);
        ctx.moveTo(w-10, 10); ctx.lineTo(w-25, 10); ctx.moveTo(w-10, 10); ctx.lineTo(w-10, 25);
        ctx.stroke();
      }

      // Tracking box
      if (ladleAtStation) {
        const boxX = w * 0.25;
        const boxY = h * 0.3;
        const boxW = w * 0.5;
        const boxH = h * 0.55;

        ctx.strokeStyle = isThermalMode ? '#ef4444' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(jitter(boxX), jitter(boxY), jitter(boxW), jitter(boxH));

        ctx.fillStyle = isThermalMode ? '#ef4444' : '#ffffff';
        ctx.fillRect(boxX - 1, boxY - 18, 95, 18);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        const confidence = 95 + Math.floor(Math.random() * 4);
        ctx.fillText(`${ladleAtStation.ladleId} [CONF: ${confidence}%]`, boxX + 6, boxY - 5);

        // Diagnostics
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(boxX + 10, boxY + 10, 120, 65);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 10, boxY + 10, 120, 65);

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText(`TEMP: ${ladleAtStation.currentTemperature}°C`, boxX + 16, boxY + 24);
        ctx.fillText(`MASS: ${ladleAtStation.materialWeight + ladleAtStation.slagWeight}T`, boxX + 16, boxY + 36);
        ctx.fillText(`STATE: ${ladleAtStation.status}`, boxX + 16, boxY + 48);
        ctx.fillText(`WEAR : ${Math.floor(ladleAtStation.refractoryHealth)}%`, boxX + 16, boxY + 60);

        // Hotspot
        if (ladleAtStation.hotspotDetected) {
          const hsX = w * 0.5 + jitter(10, 4);
          const hsY = h * 0.6 + jitter(10, 4);
          const r = 15 + Math.sin(Date.now() / 150) * 5;

          ctx.beginPath();
          ctx.arc(hsX, hsY, r, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(hsX - r, hsY - r, r * 2, r * 2);
        }
      }

      // Compliance check
      const isPPEViolation = manualAnomalies.ppeViolation === id || (id && name && name.includes(manualAnomalies.ppeViolation));
      const workers = [
        { name: 'Worker #034', x: w * 0.15, y: h * 0.75, w: w * 0.08, h: h * 0.22, alert: isPPEViolation }
      ];

      workers.forEach(worker => {
        ctx.strokeStyle = worker.alert ? '#ef4444' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(jitter(worker.x), jitter(worker.y), jitter(worker.w), jitter(worker.h));

        const helmetX = worker.x;
        const helmetY = worker.y - 12;
        ctx.fillStyle = worker.alert ? '#ef4444' : '#ffffff';
        ctx.fillRect(helmetX, helmetY, worker.w + 10, 12);

        ctx.fillStyle = '#000000';
        ctx.font = '8px monospace';
        ctx.fillText(worker.alert ? 'SAFETY ALERT!' : 'SAFETY: OK', helmetX + 3, helmetY + 9);
      });

      // Molten spill
      const isSpill = manualAnomalies.spill === ladleAtStation?.ladleId;
      if (isSpill) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.85);
        ctx.lineTo(w * 0.6, h * 0.82);
        ctx.lineTo(w * 0.75, h * 0.95);
        ctx.lineTo(w * 0.35, h * 0.92);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      animationId = requestAnimationFrame(drawCVOverlay);
    };

    drawCVOverlay();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [ladleAtStation, manualAnomalies, mode, id, name]);

  return (
    <div className={`bg-black col-span-1 row-span-1 flex flex-col justify-between border-2 border-white ${bRadius ? 'rounded-xl' : ''} p-2 text-white shadow-lg relative h-full w-full`}>
      {/* Top Label: above the camera feed */}
      <div className="font-pixel text-2xl text-left border-b border-slate-900 pb-1 mb-1 truncate text-white">
        [ladle {ladleView}]
      </div>

      {/* Video Container */}
      <div className="relative flex-1 w-full overflow-hidden min-h-0 bg-slate-950">
        {clickable && (
          <a href="/camera">
            <div className="bg-white absolute top-0 right-0 aspect-[1/1] w-[28px] z-50 flex justify-center items-center rounded-bl cursor-pointer">
              <img src={arrow} alt="Expand" className="w-[14px]" />
            </div>
          </a>
        )}
        <video
          ref={videoRef}
          muted
          autoPlay
          loop
          playsInline
          src={camFeed}
          className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Bottom Label: below the camera feed */}
      <div className="font-pixel text-2xl text-left border-t border-slate-900 pt-1 mt-1 truncate text-white">
        [CAM-0{id} {name}]
      </div>
    </div>
  );
}
