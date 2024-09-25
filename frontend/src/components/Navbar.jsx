import React from 'react';
import { Link } from 'react-router-dom';
import { useState , useEffect} from 'react';
import axios from 'axios';
import apiAddressData from '../assets/contractAddress.json'
const apiAddress = apiAddressData.apiAddress
const Navbar = () => {
    const [account, setCurrentAccount] = useState(null)
    const [role, setRole] = useState('none')
    const getRole = async() => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
            alert("Make sure you have Metamask installed!");
            return;
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
            } else {
            console.log("No authorized account found");
            }
            console.log(account)
            const response = await axios.post(`http://${apiAddress}/auth/login`, { metamaskId: account });
            if (response.status === 200) {
                setRole(response.data.role);
                console.log('set role as' + response.data.role)
            }else{
                console.log('ERROR GETTING ROLE!')
            }
        }catch(error){
            console.log('ERROR: ', error)
        }
    }

    useEffect(() => {
        getRole()
      }, []);
    return (
        <nav className="bg-white p-4 mx-auto w-4/5 max-w-6xl shadow-lg rounded-lg" style={{ position: 'fixed', top: '20px', left: '10%', right: '10%', zIndex: 1000 }}>
            <div className="container flex justify-between items-center">
                <h1 className="text-black text-2xl font-bold"><Link to="/">DeMESP</Link></h1>
                <ul className="flex space-x-4">
                    <li>
                        <Link to={role =='patient' ? '/dashboard' : '/re/dashboard'} className="text-black hover:bg-[#D6D5B3] rounded px-3 py-2">Home</Link>
                    </li>
                    <li>
                        <Link  className="text-black hover:bg-[#D6D5B3] rounded px-3 py-2">About</Link>
                    </li>
                    {/* <li>
                        <Link to="/addrecords/" className="text-black hover:bg-blue-700 rounded px-3 py-2">Records</Link>
                    </li> */}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
