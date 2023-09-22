import React from 'react'

export default function DetailsButton({link}) {
  return (
    <a href={link}><button className='bg-white rounded-3xl py-2 px-4 text-black'>Show Details</button></a>
  )
}
