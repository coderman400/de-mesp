import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import abi from '../contracts/MedicalDataConsent.json';
const contractABI = abi.abi; // Make sure to access the correct property

const CONTRACT_ADDRESS = '0x715cDcEd28e9Ef205348815fB97E48D18897CA6d';

const ViewRequests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Ensure MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
          const userAddress = window.ethereum.selectedAddress;
          console.log('Current user address:', userAddress);

        // Fetch "AccessRequested" events for the current user (patient)
          const filter = contract.filters.AccessRequested(null, userAddress);

          const eventLogs = await contract.queryFilter(filter);

          const eventDetails = eventLogs.map(log => ({
            researcher: log.args.researcher,
            patient: log.args.patient
          }));

          setEvents(eventDetails);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
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
