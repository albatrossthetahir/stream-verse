"use client";
import React, { useState } from 'react';
import CommenInput from '../../commenElements/CommenInput';

const Step1Password = ({ email, onNext }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 4 || password.length > 60) {
      setError('Password must be between 4 and 60 characters.');
      return;
    }
    setError('');
    onNext(password);
  };

  return (
    <div className='max-w-[450px] w-full bg-black/75 rounded-lg relative z-20 p-8 sm:p-14 border border-zinc-800/40 shadow-2xl backdrop-blur-md select-none text-left'>
      <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">
        Step <span className="text-white">1</span> of <span className="text-white">3</span>
      </div>
      <h1 className='text-2xl sm:text-3xl text-white font-black m-0 mb-3 leading-tight'>
        Create a password to start your membership
      </h1>
      <p className='text-sm sm:text-base text-zinc-300 font-normal m-0 mb-6 leading-relaxed'>
        {"Just a few more steps and you're done! We hate paperwork, too."}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="relative mb-4 w-full">
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full appearance-none rounded text-zinc-400 px-4 pt-6 pb-2 text-base font-semibold leading-6 max-w-full border bg-zinc-900/30 border-zinc-700/60 cursor-not-allowed" 
          />
          <label className="absolute text-xs text-zinc-500 top-2.5 start-4 pointer-events-none">
            Email address
          </label>
        </div>

        <CommenInput 
          id="signup-password"
          label='Add a password' 
          type='password' 
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          error={error}
        />

        <button 
          type='submit' 
          className='w-full block py-4 leading-6 text-base font-bold text-white bg-[#e50914] hover:bg-red-700 active:bg-red-800 rounded duration-200 transition-all font-sans uppercase tracking-wide mt-2'
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default Step1Password;
