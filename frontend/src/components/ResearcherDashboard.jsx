import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import apiAddressData from '../assets/contractAddress.json'
import contractData from '../json/MedicalDataConsent.json';
import axios from 'axios';
const abi = contractData.abi;
const apiAddress = apiAddressData.apiAddress
const CONTRACT_ADDRESS = apiAddressData.contractAddress;

const ResearcherDashboard = () => {
  const [tokenBalance, setTokenBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch the array of patient addresses from the backend
  const fetchPatientAddresses = async () => {
    try {
      const response = await axios.get(`http://${apiAddress}/user/list`);
      console.log(response);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient addresses:', error);
      setErrorMessage('Error fetching patient addresses.');
      return [];
    }
  };

  // Check consent for each patient and retrieve the dataHash
  const fetchConsentedRecords = async () => {
    try {
      if (!window.ethereum) {
        setErrorMessage('MetaMask is not installed!');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const researcherAddress = await signer.getAddress();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const patientAddresses = await fetchPatientAddresses();
      const consentedRecords = [];

      for (const patient of patientAddresses) {
        const hasConsent = await contract.hasConsent(patient);

        if (hasConsent) {
          const medicalRecord = await contract.medicalRecords(patient);
          consentedRecords.push({ patient, dataHash: medicalRecord.dataHash });
        }
      }

      setRecords(consentedRecords);
      console.log(consentedRecords)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching consented records:', error);
      setErrorMessage('Error fetching consented records.');
      setLoading(false);
    }
  };

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
    fetchConsentedRecords();
  }, []);

  const goToRequests = () => navigate('/request');
  const goToDatasets = () => navigate('/datasets');

  return (
    <div className='w-full mt-36'>
      <div className='max-w-6xl mx-auto grid grid-cols-2 gap-8 items-start'>
      <div id="card-1" className='bg-white w-full p-4 rounded-xl text-center shadow-lg'>
      <h1 className='font-bold text-4xl m-4'>Welcome, <span className='text-[#7EB77F]'>{address.slice(0, 9)}...</span></h1>
          <button onClick={goToRequests} className='my-4 h-fit font-bold text-xl rounded-xl p-3 w-4/5 bg-[#ED7B84] text-white hover:bg-[#F5DBCB] ease-linear duration-75'>
            Request Data
          </button>
          <button onClick={goToDatasets} className='my-4 h-fit font-bold text-xl rounded-xl p-3 w-4/5 bg-[#7EB77F] text-white hover:bg-[#D6D5B3] ease-linear duration-75'>
            View Datasets
          </button>
      </div>
      <div>
          <div className='bg-white rounded-xl shadow-lg p-4 mb-8'>
            <h1 className='font-bold text-4xl m-4'>Tokens</h1>
            <hr className='bg-black h-0.5'></hr>
            {loading ? (
              <p>Loading balance...</p>
            ) : (
              <p className='text-2xl font-semibold m-4'>{tokenBalance !== null ? `${tokenBalance} ETH` : 'Unable to fetch balance'}</p>
            )}
          </div>
          <div className='bg-white rounded-xl shadow-lg p-4'>
            <h1 className='font-bold text-4xl m-4'>Available Data</h1>
            <hr className='bg-black h-0.5'></hr>
            {records.map((record,index) => {
            let bg= index%2==0 ? 'bg-[#7EB77F]' : 'bg-[#ED7B84]'
            return (<p key= {index} className={`text-lg font-semibold m-4 h-fit rounded-xl p-5 w-fit ${bg}`}>
              {record.patient.slice(0,25)}... <span className='font-bold text-white'>has provided access</span>
            </p>
            )
          })}
          </div>
      </div>
          
      </div>
    </div>
  );
};

export default ResearcherDashboard;
