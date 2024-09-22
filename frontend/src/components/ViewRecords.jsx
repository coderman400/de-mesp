import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import apiData from '../assets/contractAddress.json';
const apiAddress = apiData.apiAddress;
const getRecordsAPI = `http://${apiAddress}/user/views`; // Backend API endpoint

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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
        setRecords(response.data.userUploads || []); // Set records from response
      } catch (error) {
        console.error('Error fetching records:', error.message);
        setErrorMessage('Failed to fetch records.');
      }
    };

    fetchRecords();
  }, [currentAccount]);

  // Function to handle file download from backend using IPFS hash
  const downloadFile = async (ipfsHash, fileName) => {
    try {
      const response = await axios.post(
        `http://${apiAddress}/request/get`, // Backend download endpoint
        { ipfsHash }, 
        {
          responseType: 'blob', // Important to receive file as blob
        }
      );

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'medical_record.txt'); // Customize the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setErrorMessage('Error downloading file.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex justify-center items-center h-fit w-full'>
      <div className='bg-white shadow-md rounded p-4 w-4/5'>
        <h1 className='text-2xl font-bold mb-4'>My Records</h1>
        <hr className='bg-black h-0.5'></hr>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {records.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <ul className='py-2'>
            {records.map((record, index) => (
              <li key={index} className='flex justify-between items-center m-2'>
                <span>{record.disease}</span>
                <button
                  className='bg-green-500 text-white p-2 rounded hover:bg-green-600'
                  onClick={() => downloadFile(record.genMedInfoHash, record.fileName)}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewRecords;
