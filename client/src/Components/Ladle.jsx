import React from 'react'
import DetailsButton from './DetailsButton'

export default function Ladle() {
  return (
    <div className='col-span-1 row-span-1 bg-black text-white flex flex-col'>
      <div className='flex flex-1'>
        <div className='flex-1 bg-white'></div>
        <div className='flex-1'>

        </div>
      </div>
      <div className='flex-1 flex flex-col justify-center m-2 gap-3'>
        <div className=''>Status<br/>Last Station - Heat Tapping [23:04:43]</div>
        <a href="/lts"><div className='flex justify-center items-center'><DetailsButton/></div></a>
      </div>  
    </div>
  )
}
