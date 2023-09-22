import React from 'react'
import download from '../Assets/download.png'

export default function Logs() {
  return (
    <div className='bg-black m-2'>
        <div className='flex flex-col gap-4 text-white text-xl'>
        <h1>[06:00:15] Steel furnace [1] preheating for morning shift</h1>
        <h1>[06:15:30] Raw material delivery [A123] received at the plant</h1>
        <h1>[06:30:45] Production line [3] started for steel frames</h1>
        <h1>[07:05:22] Quality inspection [Batch #567] in progress</h1>
        <h1>[07:30:10] Welding station [B] operating at full capacity</h1>
        <h1>[08:10:55] Steel cooling process initiated [Water Quench]</h1>
        <h1>[08:45:20] Finished steel frames [Lot #789] ready for shipment</h1>
        <h1>[09:15:40] Maintenance crew [Team 2] repairing conveyor</h1>
        <h1>[10:00:18] Steel frame order [Customer X] confirmed</h1>
        <h1>[11:30:05] Steel recycling [Scrap Collection] underway</h1>

        </div>
        <div className='h-[50px] w-[170px] cursor-pointer rounded-full bg-white absolute bottom-[4%] right-[4%] flex justify-around items-center p-2'>
            <h1 className='font-bold'>Download</h1>
            <img src={download} alt="" className='w-[40px] f-[40px]' />
        </div>
    </div>
  )
}
