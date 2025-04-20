import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Car } from 'lucide-react';

function AddCab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [pricePerKm, setPricePerKm] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Get provider ID
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (providerError) throw providerError;

      const { error } = await supabase.from('cabs').insert([
        {
          provider_id: providerData.id,
          vehicle_type: vehicleType,
          base_price: parseFloat(basePrice),
          price_per_km: parseFloat(pricePerKm),
          available: true,
        },
      ]);

      if (error) throw error;

      alert('Cab service added successfully!');
      navigate('/add-service');
    } catch (error) {
      console.error('Error adding cab service:', error);
      alert('Failed to add cab service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <Car className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Add Cab Service</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select vehicle type</option>
                <option value="Economy">Economy</option>
                <option value="Premium Sedan">Premium Sedan</option>
                <option value="Luxury SUV">Luxury SUV</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Kilometer
              </label>
              <input
                type="number"
                value={pricePerKm}
                onChange={(e) => setPricePerKm(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Adding Cab Service...' : 'Add Cab Service'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCab;