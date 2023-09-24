import React from 'react'
import rhomboid from '../Assets/rhomboid.jpg'

export default function Map() {
  return (
    <div className='relative col-span-2 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl p-3 border-2 border-white'>
    <h1 className='font-pixel text-2xl'>Rhomboidity</h1>
    <img src={rhomboid} alt="" className='absolute inset-0 object-contain h-full w-full'/>
</div>
  )
}