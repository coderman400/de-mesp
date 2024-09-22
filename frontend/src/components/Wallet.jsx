import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoleSelectionModal from './RoleSelectionModal'; // Import the modal component
import apiData from '../assets/contractAddress.json';
import metamaskImage from '../assets/metamask.png'; // Import the image

const apiAddress = apiData.apiAddress;

function Auth() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  
  const navigate = useNavigate();

  const goToResearchDashboard = () => navigate('/re/dashboard'); // Navigate to researcher dashboard
  const goToDashboard = () => navigate('/dashboard');
  
  const handleLogin = async (address) => {
    try {
      const response = await axios.post(`http://${apiAddress}/auth/login`, { metamaskId: address });
      if (response.status === 200) {
        setRole(response.data.role);
        
        // Show modal if the role is "none"
        if (response.data.role === "none") {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    try {
      const response = await axios.post(`http://${apiAddress}/auth/register`, { metamaskId: currentAccount, role: selectedRole });
      if (response.status === 201) {
        setRole(selectedRole); // Update the role state
        setShowModal(false); // Close the modal
        if (selectedRole === "researcher") {
          navigate('/re/dashboard'); // Redirect to researcher dashboard
        } else {
          window.location.reload(); // Refresh the page for other roles
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have Metamask installed!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        handleLogin(accounts[0]); // Send address to backend
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log("Error connecting to Metamask", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      console.log("Connected account:", accounts[0]);

      handleLogin(accounts[0]); // Send address to backend

    } catch (error) {
      console.log("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className='h-fit w-fit flex flex-col items-center'>
      <h1 className='text-4xl text-center font-bold m-4'>Connect Metamask Wallet</h1>
      <img src={metamaskImage} alt="Metamask" className='w-48 h-48' /> {/* Display the image above the buttons */}
      {currentAccount ? (
        <div className='p-2 flex flex-col items-center'>
          {role === 'researcher' ? (
            <button className='w-full font-bold bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-300' onClick={goToResearchDashboard}>Research Dashboard</button>
          ) : (
            <button className='w-full font-bold bg-green-500 text-white p-2 rounded mt-4 hover:bg-green-300' onClick={goToDashboard}>Dashboard</button>
          )}
          {role && <p className='m-4 text-lg font-bold text-center'>Your role: <span className='text-[#ED7B84]'>{role}</span></p>} {/* Display the user's role */}
        </div>
      ) : (
        <button className='w-full font-bold bg-[#D6D5B3] text-white p-2 my-2 rounded mt-4 hover:bg-[#ED7B84]' onClick={connectWallet}>Connect Wallet</button>
      )}
      
      {showModal && (
        <RoleSelectionModal 
          onSelectRole={handleRoleSelection} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

export default Auth;
