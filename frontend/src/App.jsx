import { useState } from 'react';
import { Wallet, NotFound, Datasets, Navbar, Register, ViewRecords, Request, AddRecords, BloodReport, Diagnosis, PhysicalCheckup, Dashboard, ResearcherDashboard, ViewRequests, AccessLogs } from './components';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Now, this is inside the Router context

  // Check if the current route is "/dashboard" or "/re/dashboard"
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/re/dashboard';

  return (
    <>
      <Navbar />
      {/* Conditionally apply styles based on the route */}
      <main className={`flex justify-center ${!isDashboard ? 'bg-white m-40 mx-64 p-4 shadow-md max-w-screen-xl rounded-xl' : ''}`}>
        <Routes>
          <Route path="/" element={<Wallet />} />
          <Route path="/register" element={<Register />} />
          <Route path="/addrecords" element={<AddRecords />} />
          <Route path="/addrecords/blood-report" element={<BloodReport />} />
          <Route path="/addrecords/diagnosis" element={<Diagnosis />} />
          <Route path="/addrecords/physical-checkup" element={<PhysicalCheckup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/re/dashboard" element={<ResearcherDashboard />} />
          <Route path="/viewrequests" element={<ViewRequests />} />
          <Route path="/viewrecords" element={<ViewRecords />} />
          <Route path="/request" element={<Request />} />
          <Route path="/accesslogs" element={<AccessLogs />} />
          <Route path="/datasets" element={<Datasets />} />
          {/* Fallback route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
