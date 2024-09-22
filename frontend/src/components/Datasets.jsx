import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import contractData from '../json/MedicalDataConsent.json'; 
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;
const apiAddress = contractAddressData.apiAddress;

const Datasets = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching consented records:', error);
      setErrorMessage('Error fetching consented records.');
      setLoading(false);
    }
  };

  // Function to handle sending IPFS hash to backend and getting file in return
  const downloadFile = async (ipfsHash) => {
    try {
      const response = await axios.post(
        `http://${apiAddress}/request/get`, // Replace with your backend download endpoint
        { ipfsHash }, 
        {
          responseType: 'blob', // Important for receiving files as a blob
        }
      );
      
      // Create a link element and simulate a click to download the file
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

  useEffect(() => {
    fetchConsentedRecords();
  }, []);

  if (loading) {
    return <div>Loading datasets...</div>;
  }

  if (errorMessage) {
    return <div className="text-red-500">{errorMessage}</div>;
  }

  return (
    <div className='flex justify-center min-h-60 h-full w-full'>
      {records.length === 0 ? (
        <p>No datasets available...</p>
      ) : (
        <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-gray-200 text-gray-600 uppercase text-xl leading-normal'>
              <th className='py-3 px-6 text-left'>#</th>
              <th className='py-3 px-6 text-left'>Patient</th>
              <th className='py-3 px-6 text-left'>IPFS Hash</th>
              <th className='py-3 px-6 text-left'>Action</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 text-lg font-light'>
            {records.map((record, index) => (
              <tr key={index} className='border-b border-gray-200 hover:bg-gray-100'>
                <td className='py-3 px-6 text-left whitespace-nowrap'>{index + 1}</td>
                <td className='py-3 px-6 text-left'>{record.patient}</td>
                <td className='py-3 px-6 text-left'>
                  <a href={`https://ipfs.io/ipfs/${record.dataHash}`} target='_blank' rel='noopener noreferrer'>
                    {record.dataHash}
                  </a>
                </td>
                <td className='py-3 px-6 text-left'>
                  <button
                    className='bg-[#ED7B84] text-white py-2 px-4 rounded hover:bg-[#F5DBCB] hover:text-gray-400 ease-linear duration-75'
                    onClick={() => downloadFile(record.dataHash)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Datasets;
