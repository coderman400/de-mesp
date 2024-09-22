import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json'; // Import ABI
import contractAddressData from '../assets/contractAddress.json';
import apiData from '../assets/contractAddress.json'
const apiAddress = apiData.apiAddress

const contractAddress = contractAddressData.contractAddress;
const abi = contractData.abi;
const getDataAPI = `http://${apiAddress}/request/upload-events`;

const Request = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(getDataAPI);
        setPatients(response.data); // Assuming response.data is an array of patient objects
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const requestAccess = async (patientAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.requestAccess(patientAddress);
      await tx.wait();

      alert(`Access request sent to ${patientAddress}!`);

      // Remove the patient from the list after the request
      const updatedPatients = patients.filter(patient => patient.userAddress !== patientAddress);
      setPatients(updatedPatients); // Update local state to remove the patient
    } catch (error) {
      console.error('Error requesting access:', error);
    }
  };

  if (loading) {
    return <div>Loading patients...</div>;
  }

  return (
    <div className='flex justify-center items-center h-fit w-full'>
      <div className='bg-white shadow-md rounded p-4 w-4/5'>
        <h1 className='text-4xl font-bold mb-4'>Request Access</h1>
        <hr className='bg-black h-0.5'></hr>
        {patients.length === 0 ? (
          <p>No current requests available.</p>
        ) : (
          <ul className='py-2'>
            {patients.map((patient, index) => (
              <li key={index} className='flex justify-between items-center m-2 text-lg'>
                <div>
                    <span className='mr-8'>{index + 1}</span>
                    <span className='mx-3 font-semibold'>{patient.disease}</span>
                </div>
                <button
                  onClick={() => requestAccess(patient.userAddress)}
                  className='bg-[#ED7B84] text-white p-2 rounded hover:bg-[#F5DBCB] ease-linear duration-75'
                >
                  Request Access
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Request;
