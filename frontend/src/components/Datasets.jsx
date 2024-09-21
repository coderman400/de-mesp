import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json';
const abi = contractData.abi;
import contractAddressData from '../assets/contractAddress.json';
const CONTRACT_ADDRESS = contractAddressData.contractAddress;

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const patients = await contract.getAccessRequesters(signerAddress);
        const datasets = [];

        for (const patient of patients) {
          const consent = await contract.consents(patient, signerAddress);

          // Show only records where consent has been given
          if (consent.isApproved) {
            const record = await contract.medicalRecords(patient);
            datasets.push({
              patient,
              dataHash: record.dataHash,  // Medical record hash
            });
          }
        }

        setDatasets(datasets);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) {
    return <div>Loading datasets...</div>;
  }

  return (
    <div className='flex justify-center min-h-96 h-full w-full'>
      {datasets.length === 0 ? (
        <p>No datasets available.</p>
      ) : (
        <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-gray-200 text-gray-600 uppercase text-xl leading-normal'>
              <th className='py-3 px-6 text-left'>#</th>
              <th className='py-3 px-6 text-left'>Patient</th>
              <th className='py-3 px-6 text-left'>Medical Record Hash</th>
            </tr>
          </thead>
          <tbody className='text-gray-600 text-lg font-light'>
            {datasets.map((dataset, index) => (
              <tr key={index} className='border-b border-gray-200 hover:bg-gray-100'>
                <td className='py-3 px-6 text-left whitespace-nowrap'>{index + 1}</td>
                <td className='py-3 px-6 text-left'>{dataset.patient}</td>
                <td className='py-3 px-6 text-left'>{dataset.dataHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Datasets;
