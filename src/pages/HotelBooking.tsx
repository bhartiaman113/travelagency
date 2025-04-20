import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Hotel, MapPin, Calendar, Star, Search } from 'lucide-react';

interface HotelType {
  id: string;
  name: string;
  location: string;
  description: string;
  price_per_night: number;
  amenities: string[];
  images: string[];
  rating: number;
  rating_count: number;
  provider_id:string;
}

function HotelBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, [location]);

  async function fetchHotels() {
    try {
      setLoading(true);
      let query = supabase.from('hotels').select('*');
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(hotel: HotelType) {
    if (!user) {
      alert('Please sign in to book a hotel');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = hotel.price_per_night * nights;

    try {
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          booking_type: 'hotel',
          service_id: hotel.id,
          start_date: checkIn,
          end_date: checkOut,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
        },
      ]).select().single();

      if (error) throw error;

      navigate('/checkout', {
        state: {
          bookingId: data.id,
          serviceType: 'hotel',
          serviceName: hotel.name,
          startDate: checkIn,
          endDate: checkOut,
          amount: totalAmount,
          details: {
            location: hotel.location,
            nights: `${nights} night${nights > 1 ? 's' : ''}`,
            price_per_night: `₹${hotel.price_per_night}`,
          },
        },
      });
    } catch (error) {
      console.error('Error booking hotel:', error);
      alert('Failed to book hotel. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Find Your Perfect Stay</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Where are you going?"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{hotel.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{hotel.description}</p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-semibold">Location:</span> {hotel.location}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={async()=> {
                        const rating = prompt('Rate this hotel (1-5):');
                        if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
                          alert('Please enter a valid rating between 1 and 5.');
                          return;
                        }
                        const { error } = await supabase
                          .from('hotels')
                          .update([
                          {
                          rating: ((hotel.rating * hotel.rating_count) + Number(rating)) / (hotel.rating_count + 1),
                          rating_count: hotel.rating_count + 1
                          },
                          ])
                          .eq('id', hotel.id);
                          setHotels((prevHotels) =>
                            prevHotels.map((h) =>
                              h.id === hotel.id ? { ...h, rating: ((hotel.rating * hotel.rating_count) + Number(rating)) / (hotel.rating_count + 1), } : h
                            )
                          );
                         
                        if (error) {

                          console.error('Error rating hotel:', error);
                        } else {
                          alert('Thank you for your feedback!');
                        }
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Rate This Hotel
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities?.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₹{hotel.price_per_night}
                      </p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                    <button
                      onClick={() => handleBooking(hotel)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelBooking;