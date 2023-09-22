import React from 'react'
import arrow from '../Assets/arrow.png'
import exclamation from '../Assets/exclamation.png'
import LifeChart from './LifeChart'

export default function Life() {
  return (
    <div className='col-span-1 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl p-3 border-2 border-yellow-500'>
        <h1 className='font-pixel text-2xl'>Life Monitoring</h1>
        <LifeChart/>
        <a href="/lts">
      <div className='py-2 px-4 rounded-xl bg-yellow-500 bottom-0 text-black font-bold flex  justify-between'>
        <div>Immediate Action Required</div>
        <img src={exclamation} alt="" className='h-[25px] w-[25px]'/>
      </div>
      </a>
    </div>
  )
}
