import Razorpay from 'razorpay';
import { loadRazorpay } from './loadRazorpay';
import { supabase } from './supabase';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
interface PaymentOptions {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  email: string;
  contact: string;
  bookingId: string;
}
// CORS issue occurs because the Razorpay API does not allow direct client-side requests.
// Solution: Use a Supabase Edge Function as a proxy to call the Razorpay Orders API.


export async function initializePayment(options: PaymentOptions) {
    try {
      const razorpay = await loadRazorpay();

      // Create Razorpay order first

      const paymentOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: options.amount * 100,
        currency: options.currency || 'INR',
        name: options.name,
        description: options.description,
        prefill: {
          email: options.email,
          contact: options.contact,
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          },
          escape: true,
          backdropclose: false
        },
        retry: {
          enabled: false
        },
        notes: {
          booking_id: options.bookingId
        },
        handler: async function (response: any) {
          try {
            console.log(response);
            // First update the booking status
            const { error: bookingError } = await supabase
              .from('bookings')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
                payment_id: response.razorpay_payment_id
              })
              .eq('id', options.bookingId);

            if (bookingError) throw bookingError;

            // Then create payment record
            const { error: paymentError } = await supabase
              .from('payments')
              .insert([
                {
                  booking_id: options.bookingId,
                  amount: options.amount,
                  currency: options.currency || 'INR',
                  status: 'completed',
                  payment_method: 'razorpay',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                },
              ]);

            if (paymentError) throw paymentError;

            // Create payout record for service provider
            const { data: booking } = await supabase
              .from('bookings')
              .select('service_id, booking_type')
              .eq('id', options.bookingId)
              .single();

            if (booking) {
              let providerTable = '';
              switch (booking.booking_type) {
                case 'hotel':
                  providerTable = 'hotels';
                  break;
                case 'bus':
                  providerTable = 'buses';
                  break;
                case 'cab':
                  providerTable = 'cabs';
                  break;
                default:
                  return;
              }

              const { data: service } = await supabase
                .from(providerTable)
                .select('provider_id')
                .eq('id', booking.service_id)
                .single();

              if (service) {
                await supabase.from('payouts').insert([
                  {
                    provider_id: service.provider_id,
                    amount: options.amount * 0.9, // Platform fee of 10%
                    status: 'pending',
                  },
                ]);
              }
            }

            alert('Payment successful!');
            window.location.href = '/profile';
          } catch (error) {
            console.error('Error processing payment:', error);
            alert('Error processing payment. Please contact support.');
          }
        },
      };

      const rzp = new razorpay(paymentOptions);
      rzp.open();
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Error initializing payment. Please try again.');
    }
  }

  export async function initializePayout(providerId: string, amount: number) {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'completed' })
        .eq('provider_id', providerId)
        .eq('status', 'pending');

      if (error) throw error;
      alert('Payout processed successfully!');
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Error processing payout. Please try again.');
    }
  }