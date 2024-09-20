import { useState } from 'react'
import { Wallet } from './components'
import './App.css'

function App() {
  return (
    <div>
      <div className='flex bg-white mt-20 mx-64 justify-center p-4 shadow-md max-w-full'>
        <Wallet></Wallet>
      </div>
    </div>
  )
}

export default App
