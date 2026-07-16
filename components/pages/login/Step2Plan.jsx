"use client";
import React, { useState } from 'react';

const PLANS_DATA = {
  monthly: [
    { id: 'mobile', name: 'Mobile', price: '$4.99', quality: 'Good', resolution: '480p', screens: 1, devices: 'Phone, Tablet' },
    { id: 'basic', name: 'Basic', price: '$9.99', quality: 'Good', resolution: '720p', screens: 1, devices: 'Phone, Tablet, Computer' },
    { id: 'standard', name: 'Standard', price: '$15.49', quality: 'Great', resolution: '1080p', screens: 2, devices: 'Phone, Tablet, Computer, TV' },
    { id: 'premium', name: 'Premium', price: '$19.99', quality: 'Best', resolution: '4K + HDR', screens: 4, devices: 'Phone, Tablet, Computer, TV' }
  ],
  yearly: [
    { id: 'mobile', name: 'Mobile', price: '$39.99', quality: 'Good', resolution: '480p', screens: 1, devices: 'Phone, Tablet' },
    { id: 'basic', name: 'Basic', price: '$79.99', quality: 'Good', resolution: '720p', screens: 1, devices: 'Phone, Tablet, Computer' },
    { id: 'standard', name: 'Standard', price: '$123.99', quality: 'Great', resolution: '1080p', screens: 2, devices: 'Phone, Tablet, Computer, TV' },
    { id: 'premium', name: 'Premium', price: '$159.99', quality: 'Best', resolution: '4K + HDR', screens: 4, devices: 'Phone, Tablet, Computer, TV' }
  ]
};

const Step2Plan = ({ onNext, initialPlan = 'premium', initialBillingCycle = 'monthly' }) => {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);

  const plans = PLANS_DATA[billingCycle];

  const handleNext = () => {
    onNext({ plan: selectedPlan, billingCycle });
  };

  return (
    <div className="max-w-[1000px] w-full mx-auto p-4 sm:p-8 text-white relative z-20 select-none">
      <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest text-left">
        Step <span className="text-white">2</span> of <span className="text-white">3</span>
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-left mb-6">
        {"Choose the plan that's right for you"}
      </h1>

      {/* Benefits List */}
      <ul className="space-y-3 mb-8 text-left max-w-xl">
        <li className="flex items-center gap-3 text-zinc-300">
          <svg className="w-5 h-5 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm sm:text-base font-medium">Watch all you want. Ad-free.</span>
        </li>
        <li className="flex items-center gap-3 text-zinc-300">
          <svg className="w-5 h-5 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm sm:text-base font-medium">Recommendations just for you.</span>
        </li>
        <li className="flex items-center gap-3 text-zinc-300">
          <svg className="w-5 h-5 text-[#e50914] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm sm:text-base font-medium">Change or cancel your plan anytime.</span>
        </li>
      </ul>

      {/* Billing Switcher */}
      <div className="flex items-center justify-center bg-zinc-900/60 border border-zinc-800 p-1.5 rounded-lg w-fit mx-auto mb-10">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
            billingCycle === 'monthly'
              ? 'bg-[#e50914] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Monthly Billing
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5 ${
            billingCycle === 'yearly'
              ? 'bg-[#e50914] text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Yearly Billing
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Save 20%
          </span>
        </button>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800/80 bg-black/60 shadow-2xl backdrop-blur-md mb-8">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
              <th className="p-6 text-zinc-400 text-sm font-semibold w-1/3">Plans</th>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <th
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-[#e50914]/15' : ''
                    }`}
                  >
                    <div className={`mx-auto w-full max-w-[120px] py-3 rounded text-base font-bold transition-all duration-200 ${
                      isSelected ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/20' : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}>
                      {p.name}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/10 transition-colors duration-150">
              <td className="p-6 text-zinc-300 font-medium">Price</td>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <td
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 font-bold ${
                      isSelected ? 'bg-[#e50914]/10 text-white text-lg' : 'text-zinc-400'
                    }`}
                  >
                    {p.price}
                    <span className="text-xs text-zinc-500 block font-normal mt-0.5">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/10 transition-colors duration-150">
              <td className="p-6 text-zinc-300 font-medium">Video Quality</td>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <td
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 font-semibold ${
                      isSelected ? 'bg-[#e50914]/10 text-white' : 'text-zinc-500'
                    }`}
                  >
                    {p.quality}
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/10 transition-colors duration-150">
              <td className="p-6 text-zinc-300 font-medium">Resolution</td>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <td
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 font-semibold ${
                      isSelected ? 'bg-[#e50914]/10 text-white' : 'text-zinc-500'
                    }`}
                  >
                    {p.resolution}
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/10 transition-colors duration-150">
              <td className="p-6 text-zinc-300 font-medium">Screens at same time</td>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <td
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-[#e50914]/10 text-white font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {p.screens}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-zinc-900/10 transition-colors duration-150">
              <td className="p-6 text-zinc-300 font-medium">Supported Devices</td>
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <td
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-6 text-center cursor-pointer transition-all duration-200 text-xs ${
                      isSelected ? 'bg-[#e50914]/10 text-white font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {p.devices}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Card Deck View (Visible on mobile < md) */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-8">
        {plans.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`p-5 rounded-lg cursor-pointer transition-all duration-200 border text-left flex flex-col relative overflow-hidden ${
                isSelected 
                  ? 'bg-black/60 border-[#e50914] shadow-lg shadow-[#e50914]/10 scale-[1.01]' 
                  : 'bg-zinc-900/40 border-zinc-800'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-[#e50914] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl">
                  Selected
                </div>
              )}
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-lg font-bold text-white">{p.name}</span>
                <span className="text-lg font-black text-white">
                  {p.price}
                  <span className="text-xs text-zinc-500 font-normal">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-zinc-800/80 pt-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Quality</span>
                  <span className="text-zinc-200 font-semibold">{p.quality}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Resolution</span>
                  <span className="text-zinc-200 font-semibold">{p.resolution}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Screens</span>
                  <span className="text-zinc-200 font-semibold">{p.screens}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Devices</span>
                  <span className="text-zinc-200 font-semibold truncate block">{p.devices}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleNext}
          className="max-w-[400px] w-full bg-[#e50914] hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 px-12 rounded transition-all duration-200 uppercase tracking-wider text-base"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Plan;
