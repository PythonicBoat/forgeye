import React from 'react'
import rhomboid from '../Assets/rhomboid.jpg'

export default function Rhomboid () {
    return (
    <div className='flex'>
        <div className='flex-1 flex justify-center items-center relative'>
          <img src={rhomboid} alt="rhomboid" />
        </div>
    </div>
    )
}