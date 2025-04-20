import React from 'react';
import { initializePayout } from '../lib/razorpay';

interface PayoutButtonProps {
  providerId: string;
  amount: number;
}

export default function PayoutButton({ providerId, amount }: PayoutButtonProps) {
  async function handlePayout() {
    try {
      await initializePayout(providerId, amount);
    } catch (error) {
      console.error('Payout error:', error);
      alert('Payout failed. Please try again.');
    }
  }

  return (
    <button
      onClick={handlePayout}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
    >
      Withdraw Funds
    </button>
  );
}