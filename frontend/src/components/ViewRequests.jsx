import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import contractData from '../json/MedicalDataConsent.json'; 
const abi = contractData.abi;
const CONTRACT_ADDRESS = '0x029363c01b720af5f07dff8f4e0e2f040c677fb7';

const ViewRequests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();  // Ensure this is correct
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  
        // Fetch the researchers who requested access
        const requesters = await contract.getAccessRequesters(signerAddress);
        
        if (requesters.length === 0) {
          console.log("No access requests found for this patient.");
          setEvents([]);  // Handle empty case
          setLoading(false);
          return;
        }
  
        const requests = requesters.map((researcher) => ({
          researcher, 
          patient: signerAddress
        }));
  
        setEvents(requests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching access requests:', error);
      }
    };
  
    fetchRequests();
  }, []);
  

  const handleApprove = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      // Call giveConsent function to approve the request
      const tx = await contract.giveConsent(researcherAddress);
      await tx.wait(); // Wait for the transaction to be mined
      console.log('Consent given to:', researcherAddress);
    } catch (error) {
      console.error('Error giving consent:', error);
    }
  };

  const handleDeny = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      // Call revokeConsent function to deny the request
      const tx = await contract.revokeConsent(researcherAddress);
      await tx.wait(); // Wait for the transaction to be mined
      console.log('Consent revoked from:', researcherAddress);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div className='flex justify-center min-h-96 h-full w-full'>
      {events.length === 0 ? (
        <p>No requests yet...</p>
      ) : (
        <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-gray-200 text-gray-600 uppercase text-xl leading-normal'>
              <th className='py-3 px-6 text-left'>#</th>
              <th className='py-3 px-6 text-left'>Researcher</th>
              <th className='py-3 px-6 text-left'>Patient</th>
              <th className='py-3 px-6 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 text-lg font-light'>
            {events.map((event, index) => (
              <tr key={index} className='border-b border-gray-200 hover:bg-gray-100'>
                <td className='py-3 px-6 text-left whitespace-nowrap'>{index + 1}</td>
                <td className='py-3 px-6 text-left'>{event.researcher}</td>
                <td className='py-3 px-6 text-left'>{event.patient}</td>
                <td className='py-3 px-6 text-center'>
                  <button
                    className='bg-green-500 text-white py-1 px-3 rounded mr-2 hover:bg-green-600'
                    onClick={() => handleApprove(event.researcher)}
                  >
                    Approve
                  </button>
                  <button
                    className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600'
                    onClick={() => handleDeny(event.researcher)}
                  >
                    Deny
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

export default ViewRequests;
