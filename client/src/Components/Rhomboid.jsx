import React from 'react'
import rhomboid from '../Assets/rhomboid.jpg'

export default function Rhomboid() {
  return (
    <div className='relative col-span-2 row-span-1 bg-black text-white flex flex-col justify-between relative rounded-xl p-3 border-2 border-white'>
    <img src={rhomboid} alt="rhomboid" className='absolute inset-0 object-contain h-full w-full'/>
</div>
  )
}