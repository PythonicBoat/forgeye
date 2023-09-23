import React from 'react'
import Ladle from '../Components/Ladle'
import Map from '../Components/Map'
import Feed from '../Components/Feed'
import Life from '../Components/Life'
import Graph from '../Components/Graph'

export default function Dashboard() {
  return (
    <div className='grid grid-cols-3 grid-rows-2 gap-3 m-2'>
        <Map/>
        <Life/>
        <Feed clickable={true} bRadius={true} id={"5"} name="Tapping Station"/>
        <Graph/>
        <Ladle/>
    </div>
  )
}
