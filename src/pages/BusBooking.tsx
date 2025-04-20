import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Bus, Calendar, MapPin, Clock } from 'lucide-react';

interface BusRoute {
  id: string;
  operator: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  provider_id: string;
  rating: number;
  rating_count: number;
}

function BusBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [source, destination]);

  async function fetchRoutes() {
    try {
      setLoading(true);
      let query = supabase.from('buses').select('*');
      
      if (source) query = query.ilike('source', `%${source}%`);
      if (destination) query = query.ilike('destination', `%${destination}%`);
      
      // Note: We're not filtering by date anymore

      const { data, error } = await query;
      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(bus: BusRoute) {
    if (!user) {
      alert('Please sign in to book a bus');
      return;
    }

    if (!selectedDate) {
      alert('Please select a travel date before booking');
      return;
    }

    try {
      // Combine the selected date with the time from departure_time
      const departureDateTime = new Date(bus.departure_time);
      const arrivalDateTime = new Date(bus.arrival_time);
      
      const travelDate = new Date(selectedDate);
      
      // Create new dates with selected date and original times
      const newDepartureDateTime = new Date(
        travelDate.getFullYear(),
        travelDate.getMonth(),
        travelDate.getDate(),
        departureDateTime.getHours(),
        departureDateTime.getMinutes()
      );
      
      const newArrivalDateTime = new Date(
        travelDate.getFullYear(),
        travelDate.getMonth(),
        travelDate.getDate(),
        arrivalDateTime.getHours(),
        arrivalDateTime.getMinutes()
      );
      
      // If arrival is earlier than departure, it means it arrives next day
      if (newArrivalDateTime < newDepartureDateTime) {
        newArrivalDateTime.setDate(newArrivalDateTime.getDate() + 1);
      }

      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: user.id,
          booking_type: 'bus',
          service_id: bus.id,
          start_date: newDepartureDateTime.toISOString(),
          end_date: newArrivalDateTime.toISOString(),
          total_amount: bus.price,
          status: 'pending',
          payment_status: 'pending',
        },
      ]).select().single();

      if (error) throw error;

      navigate('/checkout', {
        state: {
          bookingId: data.id,
          serviceType: 'bus',
          serviceName: bus.operator,
          startDate: newDepartureDateTime.toISOString(),
          endDate: newArrivalDateTime.toISOString(),
          amount: bus.price,
          details: {
            source: bus.source,
            destination: bus.destination,
            travel_date: format(new Date(selectedDate), 'PP'),
            departure_time: format(departureDateTime, 'p'),
            arrival_time: format(arrivalDateTime, 'p'),
            available_seats: bus.available_seats.toString(),
          },
        },
      });
    } catch (error) {
      console.error('Error booking bus:', error);
      alert('Failed to book bus. Please try again.');
    }
  }

  // Format just the time part from a datetime string
  function formatTimeOnly(dateTimeStr: string) {
    return format(new Date(dateTimeStr), 'p'); // 'p' formats as time only
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Search Bus Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter source city"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter destination city"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
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
          <div className="space-y-6">
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No bus routes found matching your criteria.</p>
              </div>
            ) : (
              routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row justify-between items-center"
                >
                  <div className="flex items-center mb-4 md:mb-0">
                    <Bus className="h-8 w-8 text-indigo-600 mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold">{route.operator}</h3>
                      <p className="text-gray-600">
                        {route.source} to {route.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mb-4 md:mb-0">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-600">Departure</p>
                    </div>
                    <p className="font-semibold">
                      {formatTimeOnly(route.departure_time)}
                    </p>
                  </div>
                  <div className="text-center mb-4 md:mb-0">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-600">Arrival</p>
                    </div>
                    <p className="font-semibold">
                      {formatTimeOnly(route.arrival_time)}
                    </p>
                  </div>
                  <div className="text-center mb-4 md:mb-0">
                    <p className="text-sm text-gray-600">Available Seats</p>
                    <p className="font-semibold">{route.available_seats}</p>
                  </div>
                  <div className="text-center mb-4 md:mb-0">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-semibold">{route.rating}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 mb-2">
                      ₹{route.price}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleBooking(route)}
                        className={`w-full px-4 py-2 rounded-md transition-colors ${
                          !selectedDate
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        disabled={route.available_seats === 0 || !selectedDate}
                      >
                        {route.available_seats === 0
                          ? 'Sold Out'
                          : !selectedDate
                          ? 'Select Date'
                          : 'Book Now'}
                      </button>
                      <button
                        onClick={async () => {
                          const rating = prompt('Rate this bus route (1-5):');
                          if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
                            alert('Please enter a valid rating between 1 and 5.');
                            return;
                          }
                          const { error } = await supabase
                            .from('buses')
                            .update([
                              {
                                rating: ((route.rating * route.rating_count) + Number(rating)) / (route.rating_count + 1),
                                rating_count: route.rating_count + 1,
                              },
                            ])
                            .eq('id', route.id);
                          setRoutes((prevRoutes) =>
                            prevRoutes.map((r) =>
                              r.id === route.id ? { ...r, rating:((route.rating * route.rating_count) + Number(rating)) / (route.rating_count + 1), } : r
                            )
                          );

                          if (error) {
                            console.error('Error rating bus route:', error);
                          } else {
                            alert('Thank you for your feedback!');
                          }
                        }}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                      >
                        Rate This
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusBooking;