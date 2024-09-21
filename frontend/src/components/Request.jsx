import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json'; // Import ABI
const abi = contractData.abi
const Request = () => {
  const [patientAddress, setPatientAddress] = useState('');

  const requestAccess = async () => {
    try {
      if (!patientAddress) return alert('Please enter a valid patient address.');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract('0xdbf13f83cf94670d5e4149077690da2e83d21bf2', abi, signer);

      const tx = await contract.requestAccess(patientAddress);
      await tx.wait();

      alert('Access request sent!');
    } catch (error) {
      console.error('Error requesting access:', error);
    }
  };

  return (
    <div className='flex justify-center items-center h-fit w-full'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          requestAccess();
        }}
        className='bg-white shadow-md rounded p-6 w-4/5'
      >
        <h1 className='text-4xl font-bold mb-4'>Request Access</h1>

        <label className='block text-gray-700'>Patient Address</label>
        <input
          type='text'
          value={patientAddress}
          onChange={(e) => setPatientAddress(e.target.value)}
          className='w-full p-2 mb-4 border border-gray-300 rounded'
        />

        <button type='submit' className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600'>
          Request Access
        </button>
      </form>
    </div>
  );
};

export default Request;
