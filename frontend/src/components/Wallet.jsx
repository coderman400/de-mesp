import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

function Auth() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [role, setRole] = useState(null);
  
  const navigate = useNavigate();

  const goToDashboard = () => navigate('/dashboard/');
  
  const handleLogin = async (address) => {
    try {
      const response = await axios.post('/api/login', { address });
      if (response.status === 200) {
        // Set user role based on the response
        setRole(response.data.role);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have Metamask installed!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        handleLogin(accounts[0]); // Send address to backend
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log("Error connecting to Metamask", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      console.log("Connected account:", accounts[0]);

      handleLogin(accounts[0]); // Send address to backend

    } catch (error) {
      console.log("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className='h-80 w-fit'>
      <h1 className='text-4xl text-center font-bold m-4'>Connect Metamask Wallet</h1>
      {currentAccount ? (
        <div className='p-10'>
          <p className='text-lg'>Welcome, your address: {currentAccount}</p>
          <button className='w-full font-bold bg-green-500 text-white p-2 my-2 rounded mt-16 hover:bg-green-300' onClick={goToDashboard}>Dashboard</button>
          {role && <p>Your role: {role}</p>} {/* Display the user's role */}
          {/* You can also add logic to show user info or redirect */}
        </div>
      ) : (
        <button className='w-full font-bold bg-[#D6D5B3] text-white p-2 my-2 rounded mt-16 hover:bg-[#ED7B84]' onClick={connectWallet}>Connect Wallet</button>
      )}
      
    </div>
  );
}

export default Auth;
