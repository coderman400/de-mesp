import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json'; 
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;

const ViewRequests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState(''); // To store the modal message
  const [showModal, setShowModal] = useState(false);    // To show/hide modal

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        console.log("Contract Address:", CONTRACT_ADDRESS);
        console.log("Signer Address:", signerAddress);

        const record = await contract.medicalRecords(signerAddress);
        if (!record.patient) {
          console.log("No medical record found for this patient.");
          setLoading(false);
          return;
        }

        const requesters = await contract.getAccessRequesters(signerAddress);
        console.log("Access Requesters:", requesters);

        if (requesters.length === 0) {
          setEvents([]);
        } else {
          const pendingRequests = await filterPendingRequests(requesters, contract, signerAddress);
          setEvents(pendingRequests);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching access requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const filterPendingRequests = async (requesters, contract, patientAddress) => {
    const pendingRequests = [];
    
    for (const researcher of requesters) {
      // Check if consent is already approved
      const consent = await contract.consents(patientAddress, researcher);

      // Only include if consent is not yet given
      if (!consent.isApproved) {
        pendingRequests.push({ researcher, patient: patientAddress });
      }
    }

    return pendingRequests;
  };

  // Function to handle modal and auto-hide it after 3 seconds
  const showModalWithMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const handleApprove = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.giveConsent(researcherAddress);
      await tx.wait(); 

      setEvents(events.filter(event => event.researcher !== researcherAddress)); // Remove from list
      showModalWithMessage(`Consent given to: ${researcherAddress}`);
    } catch (error) {
      console.error('Error giving consent:', error);
      showModalWithMessage('Error giving consent');
    }
  };

  const handleDeny = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.revokeConsent(researcherAddress);
      await tx.wait();

      setEvents(events.filter(event => event.researcher !== researcherAddress)); // Remove from list
      showModalWithMessage(`Consent revoked from: ${researcherAddress}`);
    } catch (error) {
      console.error('Error revoking consent:', error);
      showModalWithMessage('Error revoking consent');
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

      {/* Modal for confirmation */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-6 rounded shadow-md'>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRequests;
