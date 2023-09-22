import React from 'react'
import DetailsButton from './DetailsButton'
import ladle from "../Assets/ladle.png"
import arrow from "../Assets/arrow.png"

export default function Ladle() {
  return (
    <div className='col-span-1 row-span-1 bg-black text-white flex flex-col justify-center relative rounded-xl p-3 border-4 border-white'>
      <a href="/lts">
      <div className='rounded-bl-xl bg-white absolute top-0 right-0 aspect-[1/1] w-1/6 z-50 flex justify-center items-center'>
            <img src={arrow} alt="" />
        </div>
        </a>
      <div className='flex flex-1'>
        <div className='flex-1 flex justify-center items-center relative'>
          <img src={ladle} alt="" />
        </div>
        <div className='flex-1 mt-3'>
          Life - <span className='text-green-500'>12</span><br/>Humidity - 30<br/>Weight - 0.5 tons<br/>Temperature - 1200C<br/>Delay - <span className='text-red-500'>11 mins</span>
        </div>
      </div>
      <div className='flex-1 flex flex-col justify-center mx-2 gap-3'>
        <div className=''>Status - <span className='text-yellow-500'>Casting</span><br/>Last Station - Heat Tapping [23:04:43]</div>
        <div className='flex justify-center items-center'><DetailsButton link="/lts"/></div>
      </div>  
    </div>
  )
}
