"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import CommenInput from '../../commenElements/CommenInput';

const SignInView = ({ initialEmail = '', onSignUpNow, onLoginSuccess }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4 || password.length > 60) {
      newErrors.password = 'Password must be between 4 and 60 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const registered = localStorage.getItem("streamverse_registered_users");
      const users = registered ? JSON.parse(registered) : {};
      
      const emailKey = email.toLowerCase();
      // Allow pre-existing mock accounts
      const isDefaultUser = (emailKey === 'kalaiwalatahir@gmail.com' && password === 'EQ5Yn5m2xru0ChYR');
      
      if (users[emailKey]) {
        if (users[emailKey].password !== password) {
          setSubmitError('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }
      } else if (!isDefaultUser) {
        setSubmitError('This email is not registered yet. Please sign up first.');
        setLoading(false);
        return;
      }

      // Log in
      const res = await login(email, password);
      if (!res.success) {
        setSubmitError(res.error || 'Login failed. Please check your credentials.');
      } else {
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-[450px] w-full bg-black/75 rounded-lg relative z-20 p-8 sm:p-14 border border-zinc-800/40 shadow-2xl backdrop-blur-md select-none'>
      <h1 className='text-3xl text-white font-bold m-0 mb-7'>Sign In</h1>
      
      {submitError && (
        <div className="bg-[#e87c03] text-white text-sm py-2.5 px-4 rounded mb-5 font-medium flex items-start gap-2">
          <svg className="w-5 h-5 fill-current flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <CommenInput 
          id="signin-email"
          label='Email address' 
          type='email' 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          error={errors.email}
        />
        
        <div className='relative mb-5 w-full'>
          <input 
            id="signin-password" 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder=' ' 
            className={`w-full appearance-none rounded text-white px-4 pt-6 pb-2 text-base font-medium leading-6 max-w-full border bg-black/50 border-solid focus:ring-0 outline-0 peer transition-all duration-200 ${
              errors.password ? 'border-[#e50914] focus:border-[#e50914]' : 'border-zinc-600 focus:border-white'
            }`} 
          />
          <label 
            htmlFor="signin-password" 
            className='absolute text-sm text-zinc-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-zinc-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none'
          >
            Password
          </label>
          
          <button 
            type="button" 
            onClick={handleTogglePassword} 
            className="h-12 absolute right-0 z-10 px-4 top-1 flex items-center justify-center text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {showPassword ? (
              <span className="text-xs uppercase font-bold tracking-wider">Hide</span>
            ) : (
              <span className="text-xs uppercase font-bold tracking-wider">Show</span>
            )}
          </button>
          
          {errors.password && (
            <div className="text-[#e50914] text-xs mt-1.5 px-1 flex items-start gap-1 font-medium">
              <svg className="w-4 h-4 fill-current flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        <button 
          type='submit' 
          disabled={loading}
          className='w-full block py-3.5 leading-6 text-base font-semibold text-white bg-[#e50914] hover:bg-red-700 active:bg-red-800 rounded duration-200 transition-all font-sans mb-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase'
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-10">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors duration-200">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-[#e50914] focus:ring-0 focus:ring-offset-0" 
              defaultChecked 
            />
            Remember me
          </label>
          <a href="#" className="hover:underline hover:text-zinc-300">Need help?</a>
        </div>
      </form>

      <div className="text-zinc-500 font-medium text-sm">
        New to StreamVerse?{' '}
        <button 
          onClick={onSignUpNow} 
          className="text-white hover:underline font-bold"
        >
          Sign up now.
        </button>
      </div>
    </div>
  );
};

export default SignInView;
