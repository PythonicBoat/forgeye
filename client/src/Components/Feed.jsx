import React from 'react'
import camFeed from '../Assets/cam_feed.mp4'
import arrow from '../Assets/arrow.png'

//show the camera feeds of the deployed cameras
export default function Feed({clickable, bRadius, id, name, ladleView}) {
  return (
    <div className={`bg-black col-span-1 row-span-1 relative border-2 border-white ${bRadius?"rounded-xl":""} overflow-hidden text-white`} >
        {clickable && <a href="/camera">
        <div className='rounded-bl-xl rounded-tr-xl bg-white absolute top-0 right-0 aspect-[1/1] w-1/6 z-50 flex justify-center items-center'>
            <img src={arrow} alt="" />
        </div>
        </a>}
        <div className='absolute left-0 top-0 p-2 font-pixel text-2xl z-50'>[ladle {ladleView}]</div>
        <div className='absolute right-0 bottom-0 p-2 font-pixel text-2xl z-50'>[CAM-0{id} {name}]</div>
        <div className='w-full h-full'>
            <video muted autoPlay loop src={camFeed} className='h-full w-auto object-cover'/>
        </div>
    </div>
  )
}
