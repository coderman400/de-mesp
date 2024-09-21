import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-white p-4 mx-auto w-4/5 shadow-lg rounded-lg" style={{ position: 'fixed', top: '20px', left: '10%', right: '10%', zIndex: 1000 }}>
            <div className="container flex justify-between items-center">
                <h1 className="text-black text-2xl font-bold">DeMESP</h1>
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/dashboard" className="text-black hover:bg-blue-700 rounded px-3 py-2">Home</Link>
                    </li>
                    <li>
                        <Link to="/request" className="text-black hover:bg-blue-700 rounded px-3 py-2">Requests</Link>
                    </li>
                    <li>
                        <Link to="/addrecords/" className="text-black hover:bg-blue-700 rounded px-3 py-2">Records</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
