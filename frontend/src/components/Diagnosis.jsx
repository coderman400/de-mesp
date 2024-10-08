import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ethers } from 'ethers';
import contractData from '../json/MedicalDataConsent.json';
import contractAddressData from '../assets/contractAddress.json';
import apiData from '../assets/contractAddress.json';
const apiAddress = apiData.apiAddress;

const contractAddress = contractAddressData.contractAddress;
const abi = contractData.abi;

const DiagnosisForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [pdfFile, setPdfFile] = useState(null); // State to hold the uploaded PDF file
    const [imageFile, setImageFile] = useState(null); // State to hold the uploaded image
    const [loading, setLoading] = useState(false); // Loading state

    const onSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();

        // Handle PDF upload
        if (pdfFile) {
            formData.append('file', pdfFile);
        }

        // Handle image upload
        if (imageFile) {
            formData.append('image', imageFile);
        }

        let userAddress;
        let signer;

        // Connect to MetaMask and get the user's address
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
        } catch (error) {
            console.error('Error fetching user address:', error);
            alert('Failed to get user address.');
            setLoading(false);
            return;
        }

        // Add additional information to formData
        formData.append('userAddress', userAddress);
        formData.append('reportType', data.diagnosisName); // Add the diagnosis name

        try {
            // Send formData to the backend
            const response = await axios.post(`http://${apiAddress}/user/upload2`, formData);
            const validation = response.data.validation;
            if(validation !== "Success"){
                console.error('NOT VALID DATA')
            }else{
                const ipfsHash = response.data.cid; // The CID returned from IPFS
                // Store IPFS CID in the smart contract
                const contract = new ethers.Contract(contractAddress, abi, signer);
                const tx = await contract.addMedicalRecord(ipfsHash);
                await tx.wait(); // Wait for the transaction to be mined
                alert('Diagnosis submitted successfully!')
            }
            ;
        } catch (error) {
            console.error('Error submitting diagnosis:', error);
            alert('Failed to submit the diagnosis.');
        } finally {
            setLoading(false);
        }
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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && (file.type.includes('image'))) {
            setImageFile(file); // Store the image file
        } else {
            alert('Please upload a valid image file.');
            setImageFile(null); // Reset if not a valid image
        }
    };

    return (
        <div className='flex justify-center items-center h-fit w-full'>
            <form onSubmit={handleSubmit(onSubmit)} className='bg-white shadow-md rounded p-6 w-4/5'>
                <h1 className='text-4xl font-bold mb-4'>Diagnosis Form</h1>

                {loading && <p className='text-blue-500'>Submitting, please wait...</p>} {/* Loading message */}

                <label className='block text-gray-700'>Diagnosis Desc:</label>
                <input 
                    type='text' 
                    {...register('diagnosisName', { required: true })} 
                    className='w-full p-2 mb-2 border border-gray-300 rounded'
                    disabled={loading} // Disable if loading
                />
                {errors.diagnosisName && <p className='text-red-500'>Diagnosis name is required</p>}

                {/* PDF Upload Section */}
                <label className='block text-gray-700'>Upload PDF</label>
                <input 
                    type='file' 
                    accept='application/pdf' 
                    onChange={handlePdfUpload} 
                    className='w-full p-2 mb-2 border border-gray-300 rounded'
                    disabled={loading} // Disable file input if loading
                />

                {/* Image Upload Section */}
                <label className='block text-gray-700'>Upload Image</label>
                <input 
                    type='file' 
                    accept='image/*' 
                    onChange={handleImageUpload} 
                    className='w-full p-2 mb-2 border border-gray-300 rounded'
                    disabled={loading} // Disable if loading
                />

                <button 
                    type='submit' 
                    className='w-full bg-green-500 text-white my-2 p-2 rounded hover:bg-green-600'
                    disabled={loading}> {/* Disable submit button if loading */}
                    {loading ? 'Submitting...' : 'Submit Diagnosis'}
                </button>
            </form>
        </div>
    );
}

export default DiagnosisForm;
