import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json'
const abi = contractData.abi

const BloodReportForm = () => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [additionalTests, setAdditionalTests] = useState([]);
  const [pdfFile, setPdfFile] = useState(null); // State to hold the uploaded PDF file
  const [loading, setLoading] = useState(false); // Loading state
  const isPdfUploaded = watch('pdfFile'); // Watch for PDF upload

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    
    // Handle PDF upload and IPFS CID fetching logic
    if (pdfFile) {
      formData.append('file', pdfFile);
    }

        // Connect to Ganache local blockchain
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    async function fetchBlockNumber() {
      try {
        // Fetch and log the current block number
        const blockNumber = await provider.getBlockNumber();
        console.log("Current block number:", blockNumber);
      } catch (error) {
        console.error("Error fetching block number:", error);
      }
    }

    fetchBlockNumber();


    try {
      // Send formData to the backend
      // const response = await axios.post('http://172.18.231.45:3000/upload', formData);
      // const ipfsHash = response.data.cid; // The CID returned from IPFS

      let ipfsHash='QmQ7jf3rjZKJHoZ3jGxDtrbj78cJ9kgwgmYSd7rYFvPg8Q';
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Store IPFS CID in the smart contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract('0xdbf13f83cf94670d5e4149077690da2e83d21bf2', abi, signer);

      try {
        const tx = await contract.addMedicalRecord(ipfsHash);
        await tx.wait(); // Wait for the transaction to be mined
        console.log('Transaction successful:', tx);
        alert('Blood report submitted successfully!');
      } catch (error) {
        console.error('Error submitting transaction:', error);
        alert('Transaction failed. Please try again.');
      }
      
      alert('Blood report submitted successfully!');
    } catch (error) {
      console.error('Error submitting blood report:', error);
      alert('Failed to submit the blood report.');
    } finally {
      setLoading(false);
    }

    // try {
    //   // Send formData to the backend using Axios
    //   const response = await axios.post('http://172.18.231.45:3000/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data', // Important to handle file upload
    //     },
    //   });
    //   console.log('Response:', response.data);
    //   alert('Blood report submitted successfully!');
    //   reset(); // Reset the form after successful submission
    //   setPdfFile(null); // Clear the uploaded PDF state
    // } catch (error) {
    //   console.error('Error submitting blood report:', error);
    //   alert('Failed to submit the blood report.');
    // } finally {
    //   setLoading(false); // Set loading to false after submission completes
    // }
  };

  const addTestField = () => {
    setAdditionalTests([...additionalTests, { name: '', value: '' }]);
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file); // Store the PDF file
    } else {
      alert('Please upload a valid PDF file.');
      setPdfFile(null); // Reset if not a PDF
    }
  };

  return (
    <div className='flex justify-center items-center h-fit w-full'>
      <form onSubmit={handleSubmit(onSubmit)} className='bg-white shadow-md rounded p-6 w-4/5'>
        <h1 className='text-4xl font-bold mb-4'>Blood Report Form</h1>

        {loading && <p className='text-blue-500'>Submitting, please wait...</p>} {/* Loading message */}

        <label className='block text-gray-700'>Hemoglobin (g/dL)</label>
        <input 
          type='number' 
          {...register('hemoglobin', {})} 
          className='w-full p-2 mb-2 border border-gray-300 rounded'
          disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
        />

        <label className='block text-gray-700'>RBC Count (million cells/mcL)</label>
        <input 
          type='number' 
          {...register('rbcCount', { required: !pdfFile })} 
          className='w-full p-2 mb-2 border border-gray-300 rounded'
          disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
        />
        {errors.rbcCount && <p className='text-red-500'>RBC count is required</p>}

        <label className='block text-gray-700'>WBC Count (cells/mcL)</label>
        <input 
          type='number' 
          {...register('wbcCount', { required: !pdfFile })} 
          className='w-full p-2 mb-2 border border-gray-300 rounded'
          disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
        />
        {errors.wbcCount && <p className='text-red-500'>WBC count is required</p>}

        <label className='block text-gray-700'>Platelet Count (cells/mcL)</label>
        <input 
          type='number' 
          {...register('plateletCount', { required: !pdfFile })} 
          className='w-full p-2 mb-2 border border-gray-300 rounded'
          disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
        />
        {errors.plateletCount && <p className='text-red-500'>Platelet count is required</p>}

        {additionalTests.map((test, index) => (
          <div key={index}>
            <label className='block text-gray-700'>Additional Test {index + 1}</label>
            <input 
              type='text' 
              placeholder='Test name (e.g., Vitamin D)'
              {...register(`additionalTests[${index}].name`, { required: !pdfFile })}
              className='w-full p-2 mb-2 border border-gray-300 rounded'
              disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
            />
            <input 
              type='number' 
              placeholder='Test value'
              {...register(`additionalTests[${index}].value`, { required: !pdfFile })}
              className='w-full p-2 mb-2 border border-gray-300 rounded'
              disabled={!!pdfFile || loading} // Disable if PDF is uploaded or loading
            />
          </div>
        ))}

        <button 
          type="button" 
          onClick={addTestField} 
          className='w-full bg-blue-500 text-white p-2 my-2 rounded mb-4 hover:bg-blue-600'
          disabled={!!pdfFile || loading}> {/* Disable if PDF is uploaded or loading */}
          Add Additional Test
        </button>

        {/* PDF Upload Section */}
        <label className='block text-gray-700'>Upload PDF</label>
        <input 
          type='file' 
          accept='application/pdf' 
          onChange={handlePdfUpload} 
          className='w-full p-2 mb-2 border border-gray-300 rounded'
          disabled={loading} // Disable file input if loading
        />

        <button 
          type='submit' 
          className='w-full bg-green-500 text-white my-2 p-2 rounded hover:bg-green-600'
          disabled={loading}> {/* Disable submit button if loading */}
          {loading ? 'Submitting...' : 'Submit Blood Report'}
        </button>
      </form>
    </div>
  );
}

export default BloodReportForm;
