import React from 'react';

const RoleSelectionModal = ({ onSelectRole, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Select Your Role</h2>
        <button 
          onClick={() => onSelectRole('patient')} 
          className="w-full bg-blue-500 text-white p-2 mb-2 rounded hover:bg-blue-600"
        >
          I am a Patient
        </button>
        <button 
          onClick={() => onSelectRole('researcher')} 
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          I am a Researcher
        </button>
        <button 
          onClick={onClose} 
          className="w-full text-gray-700 p-2 mt-4 rounded border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
