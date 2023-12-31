import React from 'react'
import TimeChart from './TimeChart'

export default function Graph() {
  return (
    <div className='col-span-1 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl p-3 border-2 border-white'>
        <h1 className='font-pixel text-2xl'>Turnaround Times</h1>
        {/* <LifeChart/> */}
        <TimeChart/>
    </div>
  )
}
