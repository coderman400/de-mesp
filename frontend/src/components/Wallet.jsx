import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Auth() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Make sure you have Metamask installed!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log("Error connecting to Metamask", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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
    } catch (error) {
      console.log("Error connecting wallet:", error);
    }
  };

  return (
    <div className='flex flex-col gap-10 justify-center w-1/4'>
      <h1>Sign In with Metamask</h1>
      {currentAccount ? (
        <div>
          <p>Welcome, your address: {currentAccount}</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default Auth;
