import React from 'react';
import { useNavigate } from 'react-router-dom';

function AddServiceButton({providerId}: { providerId: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={() => navigate('/add-service')}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Add New Service
      </button>
    </div>
  );
}

export default AddServiceButton;