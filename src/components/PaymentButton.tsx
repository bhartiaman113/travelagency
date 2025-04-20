import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { initializePayment } from '../lib/razorpay';
import { supabase } from '../lib/supabase';

interface PaymentButtonProps {
  amount: number;
  bookingId: string;
  description: string;
}

export default function PaymentButton({ amount, bookingId, description }: PaymentButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (!user) {
      alert('Please sign in to make a payment');
      return;
    }

    try {
      setLoading(true);
      
      // Get user's contact information
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.phone_number) {
        alert('Please update your phone number in your profile before making a payment');
        return;
      }

      // Generate a unique order ID
      

      await initializePayment({
        amount,
        name: 'TravelEase',
        description,
        email: user.email || '',
        contact: profile.phone_number,
        bookingId,
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${
        loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
      } text-white px-4 py-2 rounded-md transition-colors`}
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}