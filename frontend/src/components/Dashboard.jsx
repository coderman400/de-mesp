import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json';
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState('');
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          console.log('MetaMask is installed');

          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const userAddress = accounts[0];
            setAddress(userAddress);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //get signer details and connect contract
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

            const balanceWei = await provider.getBalance(userAddress);
            const balanceInEth = ethers.utils.formatEther(balanceWei);
            setBalance(balanceInEth);

            const requesters = await contract.getAccessRequesters(signerAddress);
            const logs = [];

            for (const requester of requesters) {
              const consent = await contract.consents(signerAddress, requester);
              logs.push({
                researcher: requester,
                isApproved: consent.isApproved,
                ipfsHash: contract.medicalRecords(signerAddress).dataHash, // Fetch the data hash associated with the patient's medical record
              });
            }
            setAccessLogs(logs);

          } else {
            console.error('No accounts found. Please connect MetaMask.');
          }
        } else {
          console.error('MetaMask is not installed.');
        }

      } catch (error) {
        console.error('Error fetching data!', error);
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
    <div className='w-full mt-36'>
      <div className='max-w-6xl mx-auto grid grid-cols-2 gap-8 items-start'>
        {/* Left column (Card) */}
        <div id="card-1" className='bg-white w-full p-4 rounded-xl text-center'>
          <h1 className='font-bold text-4xl m-4'> 
            Welcome, <span className='text-[#ED7B84]'>{address.slice(0,9)}...</span>
          </h1>
          <button onClick={goToAddRecords} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#7EB77F] hover:bg-[#D6D5B3] ease-linear duration-75'>
            Add Records
          </button>
          <button onClick={goToViewRecords} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#D6D5B3] hover:[#F5DBCB] ease-linear duration-75'>
            View Records
          </button>
          <button onClick={goToViewRequests} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#ED7B84] hover:bg-[#F92A82] ease-linear duration-75'>
            View Requests
          </button>
          <button onClick={goToAccessLogs} className='h-fit text-2xl rounded-xl m-4 p-5 w-4/5 bg-[#F92A82] hover:bg-[#ED7B84] ease-linear duration-75'>
            Access Logs
          </button>
        </div>

        {/* Right column (Token Balance) */}
        <div className='w-full'>
          <div className='bg-white p-4 rounded-xl'>
          <h1 className='font-bold text-4xl m-4'>Tokens</h1>
          <hr className='bg-black h-0.5'></hr>
          {loading ? (
            <p>Loading balance...</p>
          ) : (
            <p className='text-2xl font-semibold m-4'>{balance !== null ? `${balance} ETH` : 'Unable to fetch balance'}</p>
          )}
        </div>
        <div className='mt-16 bg-white w-full p-4 rounded-xl'>
          <h1 className='font-bold text-4xl m-4'>Access Logs</h1>
          <hr className='bg-black h-0.5'></hr>
          {accessLogs.map((log,index) => {
            <p key= {index} className='text-2xl font-semibold m-4'>
              {log.researcher}
            </p>
          })}
          
        </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
