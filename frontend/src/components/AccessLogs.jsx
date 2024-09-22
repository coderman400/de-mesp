import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json';
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;

const AccessLogs = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        if (!window.ethereum) {
          alert('MetaMask is not installed!');
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        // Get the access requesters for the patient
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching access logs:', error);
        showModalWithMessage('Error fetching access logs. Check the console for details.');
        setLoading(false);
      }
    };

    fetchAccessLogs();
  }, []);

  const showModalWithMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 3000);
  };

  const handleRevoke = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.revokeConsent(researcherAddress);
      await tx.wait();

      setAccessLogs(accessLogs.filter(log => log.researcher !== researcherAddress));
      showModalWithMessage(`Consent revoked from: ${researcherAddress}`);
    } catch (error) {
      console.error('Error revoking consent:', error);
      showModalWithMessage('Error revoking consent');
    }
  };

  if (loading) {
    return <div>Loading access logs...</div>;
  }

  return (
    <div className='flex justify-center min-h-60 h-full w-full'>
      {accessLogs.length === 0 ? (
        <p>No access logs yet...</p>
      ) : (
        <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-gray-200 text-gray-600 uppercase text-xl leading-normal'>
              <th className='py-3 px-6 text-left'>Researcher</th>
              <th className='py-3 px-6 text-left'>IPFS Hash</th>
              <th className='py-3 px-6 text-center'>Consent Status</th>
              <th className='py-3 px-6 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 text-lg font-light'>
            {accessLogs.map((log, index) => (
              <tr key={index} className='border-b border-gray-200 hover:bg-gray-100'>
                <td className='py-3 px-6 text-left'>{log.researcher}</td>
                <td className='py-3 px-6 text-left'>{log.ipfsHash}</td>
                <td className='py-3 px-6 text-center'>{log.isApproved ? 'Approved' : 'Pending'}</td>
                <td className='py-3 px-6 text-center'>
                  <button
                    className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600'
                    onClick={() => handleRevoke(log.researcher)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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

export default AccessLogs;
