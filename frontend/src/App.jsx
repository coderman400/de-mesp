import { useState } from 'react'
import { Wallet , NotFound, Register} from './components'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <main className='flex bg-white m-40 mx-64 justify-center p-4 shadow-md max-w-full'>
        <Router>
          <Routes>
            <Route path="/" element={<Wallet />} />
            <Route path="/register" element={<Register />} />
            {/* Fallback route for undefined paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
       </Router>
        
      </main>
  )
}

export default App
