import React from 'react'
import Feed from '../Components/Feed'

export default function Redspot() {
  return (
    <div className='grid grid-cols-3 grid-rows-2 gap-3 m-2'>
      <div className='row-span-1 col-span-2 bg-white'></div>
      <Feed clickable={false} bRadius={true} id={2} name="Tapping" ladleView={23}/>
      <Feed clickable={false} bRadius={true} id={2} name="Tapping" ladleView={23}/>
      <Feed clickable={false} bRadius={true} id={2} name="Tapping" ladleView={23}/>
    </div>
  )
}
