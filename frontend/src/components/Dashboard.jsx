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
          console.log('MetaMask is installed');

          // Request account access if necessary
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Request the user's MetaMask account address
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('Accounts:', accounts);

          if (accounts.length > 0) {
            const userAddress = accounts[0];
            setAddress(userAddress);
            console.log('User Address:', userAddress);

            // Create an ethers provider to connect with the blockchain
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log('Provider:', provider);

            // Fetch balance in wei (smallest unit of ETH)
            const balanceWei = await provider.getBalance(userAddress);
            console.log('Balance in Wei:', balanceWei);

            // Convert wei to ETH and set the state
            const balanceInEth = ethers.utils.formatEther(balanceWei);
            console.log('Balance in ETH:', balanceInEth);
            setBalance(balanceInEth);
          } else {
            console.error('No accounts found. Please connect MetaMask.');
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
        <h1 className='font-bold text-4xl m-4'> Welcome, <span className='text-[#ED7B84]'>{address.slice(0,9)}...</span></h1>
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
