import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, Calendar, Clock, MapPin, Building2, User } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';

interface CheckoutProps {
  bookingId: string;
  serviceType: string;
  serviceName: string;
  startDate: string;
  endDate?: string;
  amount: number;
  details: {
    [key: string]: string;
  };
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<CheckoutProps | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; phone_number: string } | null>(null);

  useEffect(() => {
    if (!location.state?.bookingId) {
      navigate('/');
      return;
    }

    setCheckoutData(location.state);
    if (user) {
      fetchProfile();
    }
  }, [location, user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600">
            <h2 className="text-2xl font-bold text-white">Checkout</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">{checkoutData.serviceName}</p>
                      <p className="text-sm text-gray-600 capitalize">{checkoutData.serviceType}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">
                        {new Date(checkoutData.startDate).toLocaleDateString()}
                      </p>
                      {checkoutData.endDate && (
                        <p className="text-sm text-gray-600">
                          to {new Date(checkoutData.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {Object.entries(checkoutData.details).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      {key.includes('time') ? (
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      ) : key.includes('location') ? (
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <div className="h-5 w-5 mr-2" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium">{profile?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {profile?.phone_number && (
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <p>{profile.phone_number}</p>
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium">₹{checkoutData.amount}</p>
                    </div>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-600">Taxes & Fees</p>
                      <p className="font-medium">₹{(checkoutData.amount * 0.18).toFixed(2)}</p>
                    </div>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="flex justify-between">
                      <p className="font-semibold">Total</p>
                      <p className="font-bold text-indigo-600">
                        ₹{(checkoutData.amount * 1.18).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <PaymentButton
                      amount={checkoutData.amount * 1.18}
                      bookingId={checkoutData.bookingId}
                      description={`Payment for ${checkoutData.serviceType} - ${checkoutData.serviceName}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;