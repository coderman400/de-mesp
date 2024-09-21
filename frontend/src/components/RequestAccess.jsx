import React from 'react';
import { ethers } from 'ethers';
import abi from '../contracts/MedicalDataConsent.json';

const CONTRACT_ADDRESS = '0x715cDcEd28e9Ef205348815fB97E48D18897CA6d';

const RequestAccess = () => {
  const handleRequestAccess = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

        const tx = await contract.requestAccess(window.ethereum.selectedAddress);
        await tx.wait(); // Wait for the transaction to be mined
        console.log('Access requested!');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
    }
  };

  return (
    <div>
      <button onClick={handleRequestAccess}>Request Access</button>
    </div>
  );
};

export default RequestAccess;
