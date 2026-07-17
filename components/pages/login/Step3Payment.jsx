"use client";
import React, { useState } from 'react';
import CommenInput from '../../commenElements/CommenInput';

const Step3Payment = ({ selectedPlan, billingCycle, onSubmit, onBack }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get plan details for visual display
  const planInfo = {
    mobile: { name: 'Mobile', price: billingCycle === 'monthly' ? '$4.99/mo' : '$39.99/yr' },
    basic: { name: 'Basic', price: billingCycle === 'monthly' ? '$9.99/mo' : '$79.99/yr' },
    standard: { name: 'Standard', price: billingCycle === 'monthly' ? '$15.49/mo' : '$123.99/yr' },
    premium: { name: 'Premium', price: billingCycle === 'monthly' ? '$19.99/mo' : '$159.99/yr' },
    promo_free: { name: 'Promotional Launch Offer', price: '$0.00' }
  }[selectedPlan] || { name: 'Promotional Launch Offer', price: '$0.00' };

  // Formatter for card number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const cropped = raw.substring(0, 16);
    const parts = [];
    for (let i = 0; i < cropped.length; i += 4) {
      parts.push(cropped.substring(i, i + 4));
    }
    setCardNumber(parts.length > 0 ? parts.join(' ') : '');
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
  };

  // Formatter for Expiration Date (adds slash after MM)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 4) raw = raw.substring(0, 4);
    
    if (raw.length > 2) {
      setExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`);
    } else {
      setExpiry(raw);
    }
    if (errors.expiry) setErrors({ ...errors, expiry: '' });
  };

  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    setCvv(raw);
    if (errors.cvv) setErrors({ ...errors, cvv: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!cardName || cardName.trim().length < 2) {
      newErrors.cardName = 'Please enter a cardholder name.';
    }

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number.';
    }

    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = 'Expiration date must be MM/YY.';
    } else {
      const month = parseInt(expiryParts[0], 10);
      const year = parseInt(expiryParts[1], 10);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Please enter a valid month (01-12).';
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.expiry = 'Expiration date must be in the future.';
        }
      }
    }

    if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV (3 or 4 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit({ cardName, cardNumber, expiry, cvv });
    }, 1500);
  };

  return (
    <div className='max-w-[450px] w-full bg-black/75 rounded-lg relative z-20 p-8 sm:p-14 border border-zinc-800/40 shadow-2xl backdrop-blur-md select-none text-left'>
      <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">
        Step <span className="text-white">2</span> of <span className="text-white">2</span>
      </div>
      
      <div className="flex items-center gap-2 text-emerald-500 mb-4">
        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">Secure Payment Gateway</span>
      </div>

      <h1 className='text-2xl sm:text-3xl text-white font-black m-0 mb-4 leading-tight'>
        Set up your payment
      </h1>

      {/* Plan Summary Box */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded mb-6 flex justify-between items-center text-sm font-semibold">
        <div>
          <span className="text-white block font-bold text-base">{planInfo.name}</span>
          <span className="text-zinc-400 text-xs font-medium capitalize">
            {selectedPlan === 'promo_free' ? 'Promotional Trial' : `${billingCycle} Billing`}
          </span>
        </div>
        <div className="text-[#e50914] text-lg font-black">{planInfo.price}</div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <CommenInput
          id="payment-name"
          label="First & Last Name"
          type="text"
          value={cardName}
          onChange={(e) => {
            setCardName(e.target.value);
            if (errors.cardName) setErrors({ ...errors, cardName: '' });
          }}
          error={errors.cardName}
        />

        <CommenInput
          id="payment-number"
          label="Card Number"
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          error={errors.cardNumber}
        />

        <div className="grid grid-cols-2 gap-4">
          <CommenInput
            id="payment-expiry"
            label="Expiry Date (MM/YY)"
            type="text"
            value={expiry}
            onChange={handleExpiryChange}
            error={errors.expiry}
          />

          <CommenInput
            id="payment-cvv"
            label="CVV"
            type="text"
            value={cvv}
            onChange={handleCvvChange}
            error={errors.cvv}
          />
        </div>

        <div className="flex items-start gap-2.5 text-xs text-zinc-400 font-medium mb-8 leading-relaxed">
          <svg className="w-5 h-5 text-zinc-500 fill-current shrink-0 mt-0.5" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p>
            Secure SSL Server. Payment info will not be shared and this forms a secure sandbox environment.
          </p>
        </div>

        <button 
          type='submit' 
          disabled={loading}
          className='w-full block py-4 leading-6 text-base font-bold text-white bg-[#e50914] hover:bg-red-700 active:bg-red-800 rounded duration-200 transition-all font-sans uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mb-4'
        >
          {loading ? 'Processing Setup...' : 'Start Membership'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-200 py-1"
        >
          Go Back and Change Plan
        </button>
      </form>
    </div>
  );
};

export default Step3Payment;
