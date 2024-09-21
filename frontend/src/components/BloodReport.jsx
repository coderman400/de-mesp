import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ethers } from 'ethers';
import MedicalDataConsent from '../contracts/MedicalDataConsent.json'; // Adjust the path to your contract's ABI

const BloodReportForm = () => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [additionalTests, setAdditionalTests] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState(null); // State for CID

  const isPdfUploaded = watch('pdfFile');

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();
    if (pdfFile) {
      formData.append('file', pdfFile);
    } else {
      formData.append('hemoglobin', data.hemoglobin);
      formData.append('rbcCount', data.rbcCount);
      formData.append('wbcCount', data.wbcCount);
      formData.append('plateletCount', data.plateletCount);
      additionalTests.forEach((test, index) => {
        formData.append(`additionalTests[${index}].name`, data.additionalTests[index].name);
        formData.append(`additionalTests[${index}].value`, data.additionalTests[index].value);
      });
    }

    try {
      const response = await axios.post('http://172.18.231.45:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Response:', response.data);
      setCid(response.data.cid); // Assume the CID is returned in the response

      // Add the record to the blockchain
      await addMedicalRecord(response.data.cid);
      alert('Blood report submitted and record added successfully!');
      reset();
      setPdfFile(null);
    } catch (error) {
      console.error('Error submitting blood report:', error);
      alert('Failed to submit the blood report.');
    } finally {
      setLoading(false);
    }
  };

  const addMedicalRecord = async (dataHash) => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = '0x715cDcEd28e9Ef205348815fB97E48D18897CA6d';

      const contract = new ethers.Contract(contractAddress, MedicalDataConsent.abi, signer);

      try {
        const tx = await contract.addMedicalRecord(dataHash); // Adjust to your function
        await tx.wait(); // Wait for transaction confirmation
        console.log('Medical record added to the blockchain:', tx);
      } catch (error) {
        console.error('Error adding medical record:', error);
        alert('Failed to add medical record to the blockchain.');
      }
    } else {
      alert('Please install MetaMask to interact with the blockchain.');
    }
  };

  const addTestField = () => {
    setAdditionalTests([...additionalTests, { name: '', value: '' }]);
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file.');
      setPdfFile(null);
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
};

export default BloodReportForm;
