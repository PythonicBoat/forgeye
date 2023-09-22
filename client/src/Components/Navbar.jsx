import React from 'react'

export default function Navbar() {
  return (
    <nav className='h-[100vh] w-[250px] bg-black'>
        <div>
            <img src="" alt="forgEye logo" />
        </div>
        <ul className='text-white'>
            <li className=''>
                <a href="/" className='p-3 m-3 box-border'>Dashboard</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/lts">LTS</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/redspot">Redspot</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/camera">Camera</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/logs">Logs</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/alerts">Alerts</a>
            </li>
            <li className='m-1 p-2'>
                <a href="/api">APIs</a>
            </li>
        </ul>
    </nav>
  )
}
