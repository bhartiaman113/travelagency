import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Car, MapPin, Calendar, Clock } from 'lucide-react';

interface CabType {
  id: string;
  vehicle_type: string;
  base_price: number;
  price_per_km: number;
  available: boolean;
}

function CabBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cabs, setCabs] = useState<CabType[]>([]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    fetchCabs();
  }, []);

  async function fetchCabs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cabs')
        .select('*')
        .eq('available', true);

      if (error) throw error;
      setCabs(data || []);
    } catch (error) {
      console.error('Error fetching cabs:', error);
    } finally {
      setLoading(false);
    }
  }

  // Simulate distance calculation (in a real app, use Google Maps API)
  function calculateDistance() {
    // Simulated distance between 5 and 50 km
    return Math.floor(Math.random() * 46) + 5;
  }

  function handleSearchCabs() {
    if (!pickup || !dropoff || !date || !time) {
      alert('Please fill in all fields');
      return;
    }
    setDistance(calculateDistance());
  }

  async function handleBooking(cab: CabType) {
    if (!user) {
      alert('Please sign in to book a cab');
      return;
    }

    if (!distance) {
      alert('Please search for cabs first');
      return;
    }

    const totalAmount = cab.base_price + (cab.price_per_km * distance);

    try {
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          booking_type: 'cab',
          service_id: cab.id,
          start_date: `${date}T${time}`,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
        },
      ]).select().single();

      if (error) throw error;

      navigate('/checkout', {
        state: {
          bookingId: data.id,
          serviceType: 'cab',
          serviceName: cab.vehicle_type,
          startDate: `${date}T${time}`,
          amount: totalAmount,
          details: {
            pickup_location: pickup,
            drop_off_location: dropoff,
            distance: `${distance} km`,
            base_price: `₹${cab.base_price}`,
            price_per_km: `₹${cab.price_per_km}`,
          },
        },
      });
    } catch (error) {
      console.error('Error booking cab:', error);
      alert('Failed to book cab. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Book a Cab</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter pickup location"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop-off Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter drop-off location"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSearchCabs}
            className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search Cabs
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : distance && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                Estimated distance: {distance} km
              </p>
            </div>
            {cabs.map((cab) => (
              <div
                key={cab.id}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row justify-between items-center"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <Car className="h-8 w-8 text-indigo-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">{cab.vehicle_type}</h3>
                    <p className="text-gray-600">Comfortable and reliable</p>
                  </div>
                </div>
                <div className="text-center mb-4 md:mb-0">
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="font-semibold">₹{cab.base_price}</p>
                </div>
                <div className="text-center mb-4 md:mb-0">
                  <p className="text-sm text-gray-600">Per Kilometer</p>
                  <p className="font-semibold">₹{cab.price_per_km}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600 mb-2">
                    ₹{(cab.base_price + (cab.price_per_km * distance)).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleBooking(cab)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CabBooking;