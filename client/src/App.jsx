import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from './Components/Navbar';

import Dashboard from './Pages/Dashboard';
import Lts from './Pages/Lts';
import Redspot from './Pages/Redspot';
import Camera from './Pages/Camera';
import Logs from './Pages/Logs';
import Rhombo from './Pages/Rhombo';
import Api from './Pages/Api';

export default function App() {
  return (
    <div className='bg-black flex h-[100vh] w-[100vw]'>
      <Router>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Dashboard/>}/>
          <Route path='/lts' element={<Lts/>}/>
          <Route path="/redspot" element={<Redspot/>}/>
          <Route path='/camera' element={<Camera/>}/>
          <Route path='/logs' element={<Logs/>}/>
          <Route path='/rhombo' elements={<Rhombo/>}/>
          <Route path='/api' element={<Api/>}/>
        </Routes>
      </Router>
    </div>
  )
}
