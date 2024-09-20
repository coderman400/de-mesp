import { useState } from 'react'
import { Wallet , NotFound, Register, AddRecords, BloodReport, Diagnosis, PhysicalCheckup} from './components'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <main className='flex bg-white m-40 mx-64 justify-center p-4 shadow-md max-w-screen-xl rounded-xl'>
        <Router>
          <Routes>
            <Route path="/" element={<Wallet />} />
            <Route path="/register" element={<Register />} />
            <Route path="/addrecords" element={<AddRecords />} />
            <Route path="/addrecords/blood-report" element={<BloodReport />} />
            <Route path="/addrecords/diagnosis" element={<Diagnosis />} />
            <Route path="/addrecords/physical-checkup" element={<PhysicalCheckup />} />
            {/* Fallback route for undefined paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
       </Router>
        
      </main>
  )
}

export default App
