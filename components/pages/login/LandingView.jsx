"use client";
import React, { useState } from 'react';

const LandingView = ({ onGetStarted, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');

  const validateEmail = (emailVal) => {
    if (!emailVal) {
      return 'Email is required.';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailVal)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onGetStarted(email);
  };

  return (
    <div className="relative z-20 text-center max-w-4xl px-6 mx-auto flex flex-col items-center justify-center min-h-[80vh] select-none">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] mb-5 max-w-3xl font-sans tracking-tight">
        Unlimited movies, TV shows, and more.
      </h1>
      <p className="text-lg sm:text-2xl text-white font-medium mb-6">
        Watch anywhere. Cancel anytime.
      </p>
      <p className="text-base sm:text-xl text-zinc-200 font-normal mb-8 max-w-2xl">
        Ready to watch? Enter your email to create or restart your membership.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-[720px]">
        <div className="flex flex-col md:flex-row gap-3 items-stretch justify-center w-full">
          <div className="relative flex-grow">
            <input
              id="landing-email"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder=" "
              className={`peer w-full h-14 md:h-16 appearance-none rounded bg-black/50 border px-4 pt-6 pb-2 text-white text-base leading-6 outline-0 focus:ring-0 transition-all duration-200 ${
                error ? 'border-[#e50914] focus:border-[#e50914]' : 'border-zinc-500 focus:border-white'
              }`}
            />
            <label
              htmlFor="landing-email"
              className="absolute text-sm text-zinc-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-zinc-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
            >
              Email address
            </label>
          </div>
          
          <button
            type="submit"
            className="bg-[#e50914] hover:bg-red-700 active:bg-red-800 text-white text-lg md:text-xl font-bold py-3.5 md:py-0 px-8 rounded flex items-center justify-center gap-2 transition-all duration-200 shrink-0 h-14 md:h-16 shadow-lg tracking-wide uppercase"
          >
            Get Started
            <svg
              className="w-4 h-4 md:w-5 md:h-5 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="text-[#e50914] text-sm mt-3 text-left font-semibold flex items-center gap-1.5 justify-center md:justify-start px-2">
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default LandingView;
