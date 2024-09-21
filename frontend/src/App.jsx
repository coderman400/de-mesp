import { useState } from 'react';
import { Wallet, NotFound, Navbar, Register, Request, AddRecords, BloodReport, Diagnosis, PhysicalCheckup, Dashboard, ViewRequests } from './components';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />
      <main className='flex bg-white m-40 mx-64 justify-center p-4 shadow-md max-w-screen-xl rounded-xl'>
        <Routes>
          <Route path="/" element={<Wallet />} />
          <Route path="/register" element={<Register />} />
          <Route path="/addrecords" element={<AddRecords />} />
          <Route path="/addrecords/blood-report" element={<BloodReport />} />
          <Route path="/addrecords/diagnosis" element={<Diagnosis />} />
          <Route path="/addrecords/physical-checkup" element={<PhysicalCheckup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewrequests" element={<ViewRequests />} />
          <Route path="/request" element={<Request />} />
          {/* Fallback route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
