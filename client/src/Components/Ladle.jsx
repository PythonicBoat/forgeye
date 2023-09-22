import React from 'react'
import ladle from "../Assets/ladle.png"
import arrow from "../Assets/arrow.png"
import exclamation from '../Assets/exclamation.png'

export default function Ladle() {
  return (
    <div className='col-span-1 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl border-4 border-white p-3'>

      <h1 className='font-pixel text-2xl'>Ladle Tracking</h1>
      <a href="/lts">
      <div className='rounded-bl-xl bg-white absolute top-0 right-0 aspect-[1/1] w-1/6 z-50 flex justify-center items-center'>
            <img src={arrow} alt="" />
        </div>
        </a>
      <div className='flex'>
        <div className='flex-1 flex justify-center items-center relative'>
          <img src={ladle} alt="" />
        </div>
        <div className='flex-1'>
          Life - <span className='text-green-500'>12</span><br/>Humidity - 30<br/>Weight - 0.5 tons<br/>Temperature - 1200C<br/>Delay - <span className='text-red-500'>11 mins</span>
        </div>
      </div>
      <a href="/lts">
      <div className='py-2 px-4 rounded-xl bg-white bottom-0 text-black font-bold flex  justify-between'>
        <div>Show Details</div>
        <img src={exclamation} alt="" className='h-[25px] w-[25px]'/>
      </div>
      </a>
    </div>
  )
}
