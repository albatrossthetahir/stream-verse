"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import CommenBtn from '../../commenElements/CommenBtn';
import CommenInput from '../../commenElements/CommenInput';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    
    const res = await login(email, password);
    setLoading(false);
    
    if (!res.success) {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className='max-w-[500px] w-full bg-[rgba(0,0,0,0.85)] rounded-xl relative z-20 p-8 sm:p-10 border border-zinc-800 shadow-2xl backdrop-blur-sm'>
        <h1 className='text-2xl sm:text-3xl text-white font-bold m-0 mb-6'>Sign In</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm py-2.5 px-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
            <CommenInput 
              id="email"
              label={'Email Or Phone Number'} 
              type={'email'} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className='relative mb-6'>
              <input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=' ' 
                className="w-full appearance-none rounded-lg text-white p-4 py-5 pb-3 text-base font-medium leading-6 max-w-full border bg-black border-solid border-[#808080b3] outline-0 peer" 
              />
              <label htmlFor="password" className='absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-5 z-10 origin-[0] start-4 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto'>Password</label>
              
              <button 
                type="button" 
                onClick={handleTogglePassword} 
                className="h-full absolute right-0 z-10 px-4 top-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <CommenBtn type={'submit'} value={loading ? 'Signing In...' : 'Sign In'} />
        </form>
    </div>
  )
}

export default SignIn;