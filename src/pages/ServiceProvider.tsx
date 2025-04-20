import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { CreditCard, Hotel, Bus, Plane, Map, Calendar, DollarSign, Clock, CheckCircle, XCircle, Filter, MapPin } from 'lucide-react';
import AddServiceButton from '../components/AddServiceButton';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  razorpay_payment_id: string;
  created_at: string;
  booking?: Booking;
}

interface Booking {
  id: string;
  booking_type: string;
  service_id: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  status: string;
  payment_status: string;
  service?: any; // Hotel or Bus or other service types
}

interface Service {
  id: string;
  name?: string;
  operator?: string;
  type: 'hotel' | 'bus' | 'flight';
  location?: string;
  source?: string;
  destination?: string;
}

function ProviderDashboard() {
  
const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'services'>('payments');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  // Fetch provider's payments and services
  useEffect(() => {
    if (user) {
      fetchPaymentsAndServices();
    }
  }, [user]);

  // Filter payments based on status
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(payment => payment.status === filterStatus));
    }
  }, [payments, filterStatus]);

  const fetchPaymentsAndServices = async () => {
    setLoading(true);
    try {
      // Step 1: Get services provided by this provider
      const providerServices = await fetchProviderServices();
      setServices(providerServices);

      // Step 2: Get all service IDs
      const serviceIds = providerServices.map(service => service.id);
      
      if (serviceIds.length === 0) {
        setPayments([]);
        setLoading(false);
        return;
      }

      // Step 3: Get bookings for these services
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('service_id', serviceIds);

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setPayments([]);
        setLoading(false);
        return;
      }

      // Step 4: Get payments for these bookings
      const bookingIds = bookingsData.map(booking => booking.id);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds);

      if (paymentsError) throw paymentsError;

      // Step 5: Combine the data
      const enhancedPayments = (paymentsData || []).map(payment => {
        const relatedBooking = bookingsData.find(booking => booking.id === payment.booking_id);
        const relatedService = providerServices.find(service => service.id === relatedBooking?.service_id);
        
        return {
          ...payment,
          booking: {
            ...relatedBooking,
            service: relatedService
          }
        };
      });

      setPayments(enhancedPayments);
      setFilteredPayments(enhancedPayments);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderServices = async () => {
    if (!user) return [];
    
    try {
      // Get hotels from this provider
      // Fetch the provider_id from the service_provider table using the user.id
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      console.log('Provider Data:', providerData);
      console.log('Provider Error:', providerError);
      
      if (providerError || !providerData) {
        console.error('Error fetching provider ID:', providerError);
        return [];
      }

      const providerId = providerData.id;

      // Get hotels from this provider
      const { data: hotelsData } = await supabase
        .from('hotels')
        .select('id, name, location')
        .eq('provider_id', providerId);
      console.log('Hotels Data:', hotelsData);
      
      // Get buses from this provider
      const { data: busesData } = await supabase
        .from('buses')
        .select('id, operator, source, destination')
        .eq('provider_id', providerId);
        console.log('Buses Data:', busesData);
        
      // Format and combine all services
      const services = [
        ...(hotelsData || []).map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          location: hotel.location,
          type: 'hotel' as const
        })),
        ...(busesData || []).map(bus => ({
          id: bus.id,
          operator: bus.operator,
          source: bus.source,
          destination: bus.destination,
          type: 'bus' as const
        }))
      ];
      
      return services;
    } catch (error) {
      console.error('Error fetching provider services:', error);
      return [];
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'flight':
        return <Plane className="h-5 w-5" />;
      default:
        return <Map className="h-5 w-5" />;
    }
  };

  const getServiceName = (service: Service) => {
    if (!service) return 'Unknown Service';
    
    switch (service.type) {
      case 'hotel':
        return service.name || 'Hotel';
      case 'bus':
        return `${service.operator || 'Bus'} (${service.source} to ${service.destination})`;
      default:
        return 'Service';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!user ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Please sign in to view your provider dashboard</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>
              
              <AddServiceButton providerId={user.id}/> 
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`py-2 px-4 mr-4 ${activeTab === 'payments' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                </button>
                <button
                  className={`py-2 px-4 ${activeTab === 'services' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('services')}
                >
                  My Services
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                <>
                  {/* Payments Tab */}
                  {activeTab === 'payments' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Payment History</h2>
                        <div className="flex items-center">
                          <Filter className="h-5 w-5 text-gray-400 mr-2" />
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-md border border-gray-300 py-1 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                      
                      {filteredPayments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No payment records found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center">
                                      {getServiceIcon(payment.booking?.booking_type || '')}
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {getServiceName(payment.booking?.service)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {payment.booking?.booking_type} booking
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {payment.currency} {payment.amount}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-sm text-gray-900">
                                      {payment.payment_method}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {payment.razorpay_payment_id}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                      {payment.status === 'completed' ? (
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                      ) : payment.status === 'failed' ? (
                                        <XCircle className="mr-1 h-3 w-3" />
                                      ) : (
                                        <Clock className="mr-1 h-3 w-3" />
                                      )}
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-sm text-gray-500">
                                    {formatDate(payment.created_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Services Tab */}
                  {activeTab === 'services' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">My Services</h2>
                      
                      {services.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No services found</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {services.map((service) => (
                            <div key={service.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                              <div className="p-6">
                                <div className="flex items-center mb-4">
                                  {getServiceIcon(service.type)}
                                  <h3 className="text-lg font-medium text-gray-900 ml-2">
                                    {service.type === 'hotel' ? service.name : service.operator}
                                  </h3>
                                </div>
                                
                                {service.type === 'hotel' && (
                                  <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {service.location}
                                    </div>
                                  </div>
                                )}
                                
                                {service.type === 'bus' && (
                                  <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {service.source} to {service.destination}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="mt-4 flex justify-between">
                                  <button
                                    onClick={() => {
                                      // Direct to manage service page
                                      // This could be implemented in a real app
                                      console.log(service.type);
                                      
                                      navigate(`/manage-service`, { state: { serviceId: service.id, type: service.type } });
                                        }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                  >
                                    Manage
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      // Direct to view bookings for this service
                                      navigate("/view-bookings", { state: { serviceId: service.id } });
                                        
                                       
                                    }}
                                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                  >
                                    View Bookings
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProviderDashboard;