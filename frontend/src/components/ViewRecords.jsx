import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const getRecordsAPI = "http://172.18.231.45:3000/user/views"; // Your backend API endpoint

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletConnection = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Make sure you have Metamask installed!");
      setLoading(false);
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No authorized account found");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
        if (!currentAccount) {
          console.log("No current account available, skipping fetch.");
          return;
        }
      
        console.log("Fetching records for account:", currentAccount);
        try {
          const response = await axios.post(getRecordsAPI, { userAddress: currentAccount });
          console.log("Response data:", response.data);
          // Access the uploads array directly from response.data
          setRecords(response.data.uploads || []); // Default to an empty array if uploads is undefined
        } catch (error) {
          console.error('Error fetching records:', error.message);
          console.error('Error response:', error.response);
        }
      };
      

    fetchRecords();
  }, [currentAccount]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex justify-center items-center h-fit w-full'>
      <div className='bg-white shadow-md rounded p-4 w-4/5'>
        <h1 className='text-2xl font-bold mb-4'>My Records</h1>
        <hr className='bg-black h-0.5'></hr>
        {records.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <ul className='py-2'>
            {records.map((record, index) => (
              <li key={index} className='flex justify-between items-center m-2'>
                <span>{record.disease}</span>
                <a 
                  href={record.downloadLink} 
                  className='bg-green-500 text-white p-2 rounded hover:bg-green-600'
                  download
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewRecords;
