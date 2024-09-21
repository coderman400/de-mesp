import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const ResearcherDashboard = () => {
  const [tokenBalance, setTokenBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
              setTokenBalance(balanceInEth);
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

  const goToViewRequests = () => navigate('/viewrequests');
  const goToDatasets = () => navigate('/datasets');

  return (
    <div className='w-screen text-center p-4'>
      <h1 className='font-bold text-4xl m-4'>Welcome, <span className='text-[#7EB77F]'>{address.slice(0, 9)}...</span></h1>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='bg-white shadow-md rounded p-6'>
          <h2 className='text-2xl font-semibold'>Your Address</h2>
          <p>{address}</p>
        </div>

        <div className='bg-white shadow-md rounded p-6'>
          <h2 className='text-2xl font-semibold'>Token Balance</h2>
          {loading ? (
            <p>Loading balance...</p>
          ) : (
            <p>{tokenBalance !== null ? `${tokenBalance} ETH` : 'Unable to fetch balance'}</p>
          )}
        </div>

        <div className='bg-white shadow-md rounded p-6 flex flex-col items-center'>
          <h2 className='text-2xl font-semibold'>Options</h2>
          <button onClick={goToViewRequests} className='mt-2 h-fit text-xl rounded-xl p-3 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
            View Requests
          </button>
          <button onClick={goToDatasets} className='mt-2 h-fit text-xl rounded-xl p-3 w-4/5 bg-slate-300 hover:bg-slate-200 ease-linear duration-75'>
            Datasets
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
