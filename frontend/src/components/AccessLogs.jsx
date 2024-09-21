import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json'; 
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        // Fetch medical record
        const record = await contract.medicalRecords(signerAddress);
        if (!record.patient) {
          console.log("No medical record found for this patient.");
          setLoading(false);
          return;
        }

        const requesters = await contract.getAccessRequesters(signerAddress);
        const logs = [];

        for (const researcher of requesters) {
          const consent = await contract.consents(signerAddress, researcher);

          // Only show those researchers with approved consent
          if (consent.isApproved) {
            logs.push({
              researcher,
              dataHash: record.dataHash,  // Medical Record Hash
              status: consent.isApproved ? 'Approved' : 'Revoked'
            });
          }
        }

        setLogs(logs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching access logs:", error);
      }
    };

    fetchAccessLogs();
  }, []);

  const handleRevoke = async (researcherAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await contract.revokeConsent(researcherAddress);
      await tx.wait(); 

      setModalMessage(`Consent revoked for: ${researcherAddress}`);
      setShowModal(true);

      // Refresh the page after 3 seconds
      setTimeout(() => {
        setShowModal(false);
        window.location.reload(); // Refresh page
      }, 3000);
    } catch (error) {
      console.error('Error revoking consent:', error);
      setModalMessage('Error revoking consent');
      setShowModal(true);

      setTimeout(() => setShowModal(false), 3000);
    }
  };

  if (loading) {
    return <div>Loading access logs...</div>;
  }

  return (
    <div className='flex justify-center min-h-96 h-full w-full'>
      {logs.length === 0 ? (
        <p>No researchers currently have access.</p>
      ) : (
        <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-gray-200 text-gray-600 uppercase text-xl leading-normal'>
              <th className='py-3 px-6 text-left'>#</th>
              <th className='py-3 px-6 text-left'>Researcher</th>
              <th className='py-3 px-6 text-left'>Medical Record Hash</th>
              <th className='py-3 px-6 text-left'>Consent</th>
              <th className='py-3 px-6 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 text-lg font-light'>
            {logs.map((log, index) => (
              <tr key={index} className='border-b border-gray-200 hover:bg-gray-100'>
                <td className='py-3 px-6 text-left whitespace-nowrap'>{index + 1}</td>
                <td className='py-3 px-6 text-left'>{log.researcher}</td>
                <td className='py-3 px-6 text-left'>{log.dataHash}</td>
                <td className='py-3 px-6 text-left'>{log.status}</td>
                <td className='py-3 px-6 text-center'>
                  {log.status === 'Approved' && (
                    <button
                      className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600'
                      onClick={() => handleRevoke(log.researcher)}
                    >
                      Revoke
                    </button>
                  )}
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

export default AccessLogs;
