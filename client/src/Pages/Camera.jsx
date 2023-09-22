import React from 'react'
import Feed from '../Components/Feed'
import DataObject from "../Assets/Data.json"

export default function Camera() {
  return (
    <div className='grid grid-cols-3 grid-rows-3 h-full w-full gap-2'>
        {DataObject.stations.map(station => (
            <Feed key={station.id} id={station.id} name={station.name} clickable={false} bRadius={false}/>
        ))}
    </div>
  )
}
