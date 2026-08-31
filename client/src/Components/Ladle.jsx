import React from 'react';
import ladleImg from "../Assets/ladle.png";
import arrow from "../Assets/arrow.png";
import exclamation from '../Assets/exclamation.png';
import { useSimulation } from '../context/SimulationContext';

export default function Ladle() {
  const { ladles, activeLadleId } = useSimulation();

  const activeLadle = ladles.find(l => l.ladleId === activeLadleId) || ladles[0];

  if (!activeLadle) {
    return (
      <div className="col-span-1 row-span-1 bg-black text-white rounded-xl border-2 border-white p-3 min-h-[220px] font-pixel text-xl">
        Ladle Tracking [EMPTY]
      </div>
    );
  }

  // Determine if there is a delay
  const isDelayed = activeLadle.timeInState > 8;

  return (
    <div className="col-span-1 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl border-2 border-white p-3 min-h-[220px]">
      <h1 className="font-pixel text-2xl">Ladle Tracking</h1>
      
      <a href="/lts">
        <div className="rounded-bl-xl rounded-tr-xl bg-white absolute top-0 right-0 aspect-[1/1] w-1/6 z-50 flex justify-center items-center">
          <img src={arrow} alt="Open LTS" />
        </div>
      </a>

      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 flex justify-center items-center relative">
          <img src={ladleImg} alt="Ladle" className="max-h-[100px] object-contain" />
          {activeLadle.hotspotDetected && (
            <span className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></span>
          )}
        </div>
        
        <div className="flex-1 font-sans text-xs leading-relaxed text-slate-300">
          Life - <span className="text-green-500 font-bold">{Math.round(activeLadle.refractoryHealth)}</span><br />
          Humidity - 30<br />
          Weight - {(activeLadle.materialWeight + activeLadle.slagWeight).toFixed(1)} tons<br />
          Temperature - {activeLadle.currentTemperature}°C<br />
          Delay - <span className={`${isDelayed ? 'text-red-500 font-bold' : 'text-slate-300'}`}>
            {activeLadle.timeInState} mins
          </span>
        </div>
      </div>

      <a href="/lts" className="block mt-1">
        <div className="py-2 px-4 rounded-xl bg-white text-black font-bold flex justify-between items-center text-sm font-sans">
          <div>Show Details</div>
          <img src={exclamation} alt="Details" className="h-[25px] w-[25px]" />
        </div>
      </a>
    </div>
  );
}
