import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from './Components/Navbar';
import { SimulationProvider } from './context/SimulationContext';

import Dashboard from './Pages/Dashboard';
import Lts from './Pages/Lts';
import Redspot from './Pages/Redspot';
import Camera from './Pages/Camera';
import Logs from './Pages/Logs';
import Rhombo from './Pages/Rhombo';
import Api from './Pages/Api';

export default function App() {
  return (
    <SimulationProvider>
      <div className='bg-black text-white flex h-[100dvh] w-[100vw] font-sans overflow-hidden'>
        <Router>
          <Navbar/>
          <div className='flex-1 h-full overflow-y-auto bg-black'>
            <Routes>
              <Route path='/' element={<Dashboard/>}/>
              <Route path='/lts' element={<Lts/>}/>
              <Route path="/redspot" element={<Redspot/>}/>
              <Route path='/camera' element={<Camera/>}/>
              <Route path='/logs' element={<Logs/>}/>
              <Route path='/rhombo' element={<Rhombo/>}/>
              <Route path='/api/*' element={<Api/>}/>
            </Routes>
          </div>
        </Router>
      </div>
    </SimulationProvider>
  )
}
