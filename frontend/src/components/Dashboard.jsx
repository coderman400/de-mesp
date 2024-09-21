import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          // Request account access if necessary
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Request the user's MetaMask account address
          const [userAddress] = await window.ethereum.request({ method: 'eth_accounts' });

          if (userAddress) {
            setAddress(userAddress);

            // Create an ethers provider to connect with the blockchain
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Fetch balance in wei (smallest unit of ETH)
            const balanceWei = await provider.getBalance(userAddress);

            // Convert wei to ETH and set the state
            const balanceInEth = ethers.utils.formatEther(balanceWei);
            setBalance(balanceInEth);
          } else {
            console.error('No accounts found. Please make sure MetaMask is connected.');
          }
        } else {
          console.error('MetaMask is not installed.');
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const navigate = useNavigate();

  const goToAddRecords = () => navigate('/addrecords/');
  const goToViewRecords = () => navigate('/viewrecords');
  const goToViewRequests = () => navigate('/viewrequests');
  const goToAccessLogs = () => navigate('/accesslogs');

  return (
    <div className='w-screen text-center'>
      <div>
        {loading ? (
          <p>Loading balance...</p>
        ) : (
          <p>Balance: {balance !== null ? `${balance} ETH` : 'Unable to fetch balance'}</p>
        )}
      </div>

      <button onClick={goToAddRecords} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
        Add Records
      </button>
      <button onClick={goToViewRecords} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
        View Records
      </button>
      <button onClick={goToViewRequests} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
        View Requests
      </button>
      <button onClick={goToAccessLogs} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
        Access Logs
      </button>
    </div>
  );
};

export default Dashboard;
