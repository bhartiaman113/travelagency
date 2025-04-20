import React, { useState } from 'react';
import AddBus from './AddBus';
import AddCab from './AddCab';
import AddHotel from './AddHotel';

function AddService() {
  const [serviceType, setServiceType] = useState('');

  return (
    <div>
      
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Add a New Service</h1>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="mb-6 px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Service Type</option>
          <option value="bus">Bus</option>
          <option value="cab">Cab</option>
          <option value="hotel">Hotel</option>
        </select>

        {serviceType === 'bus' && <AddBus />}
        {serviceType === 'cab' && <AddCab />}
        {serviceType === 'hotel' && <AddHotel />}
      </div>
    
    </div>
  );
}

export default AddService;