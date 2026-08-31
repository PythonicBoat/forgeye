import React from 'react';
import exclamation from '../Assets/exclamation.png';
import LifeChart from './LifeChart';

export default function Life() {
  return (
    <div className="col-span-1 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl p-3 border-2 border-yellow-500 min-h-[220px]">
      <h1 className="font-pixel text-2xl">Life Monitoring</h1>
      
      <div className="flex-1 flex items-center justify-center py-2">
        <LifeChart />
      </div>

      <a href="/rhombo" className="block">
        <div className="py-2 px-4 rounded-xl bg-yellow-500 text-black font-bold flex justify-between items-center text-md font-sans">
          <div>Immediate Action Required</div>
          <img src={exclamation} alt="Exclamation" className="h-[25px] w-[25px]" />
        </div>
      </a>
    </div>
  );
}
