"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../../components/pages/login/Header';
import LandingView from '../../../components/pages/login/LandingView';
import SignInView from '../../../components/pages/login/SignInView';
import Step1Password from '../../../components/pages/login/Step1Password';
import Step2Plan from '../../../components/pages/login/Step2Plan';
import Step3Payment from '../../../components/pages/login/Step3Payment';

export default function Login() {
  const [view, setView] = useState('landing'); // 'landing', 'signin', 'signup_step1', 'signup_step2', 'signup_step3'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const { signup, user } = useAuth();

  // Initialize a couple of default users in localStorage for mock authentication
  useEffect(() => {
    const registered = localStorage.getItem("streamverse_registered_users");
    if (!registered) {
      const defaults = {
        'kalaiwalatahir@gmail.com': { password: 'EQ5Yn5m2xru0ChYR', plan: 'premium', billingCycle: 'yearly' }
      };
      localStorage.setItem("streamverse_registered_users", JSON.stringify(defaults));
    }
  }, []);

  const handleGetStarted = (enteredEmail) => {
    setEmail(enteredEmail);
    
    // Check if the user is already registered in local database
    const registered = localStorage.getItem("streamverse_registered_users");
    const users = registered ? JSON.parse(registered) : {};
    
    const emailKey = enteredEmail.toLowerCase();
    const isRegistered = !!users[emailKey] || 
                         emailKey === 'kalaiwalatahir@gmail.com';
    
    if (isRegistered) {
      // Direct them to log in
      setView('signin');
    } else {
      // Direct them to step 1 (Password creation)
      setView('signup_step1');
    }
  };

  const handlePasswordNext = (enteredPassword) => {
    setPassword(enteredPassword);
    setPlan('promo_free');
    setBillingCycle('monthly');
    setView('signup_step3');
  };

  const handlePaymentSubmit = async (cardDetails) => {
    try {
      // 1. Save user details to localStorage registered list
      const registered = localStorage.getItem("streamverse_registered_users");
      const users = registered ? JSON.parse(registered) : {};
      
      users[email.toLowerCase()] = {
        password,
        plan,
        billingCycle,
        cardDetails: {
          cardName: cardDetails.cardName,
          cardNumber: `XXXX XXXX XXXX ${cardDetails.cardNumber.slice(-4)}`
        }
      };
      
      localStorage.setItem("streamverse_registered_users", JSON.stringify(users));

      // 2. Complete signup via AuthContext (it redirects to /profiles automatically)
      const res = await signup(email, password);
      if (!res.success) {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during signup.");
    }
  };

  const isLandingOrSignIn = view === 'landing' || view === 'signin';
  const showHeaderSignIn = view === 'landing' || view.startsWith('signup_step');

  return (
    <div 
      className={`min-h-screen w-full relative transition-all duration-300 flex flex-col justify-center items-center py-24 px-4 ${
        isLandingOrSignIn 
          ? "bg-cover bg-no-repeat bg-center login-bg after:w-full after:h-full after:absolute after:top-0 after:left-0 after:bg-black/60 after:z-10" 
          : "bg-[#141414]"
      }`}
    >
      <Header 
        showSignInBtn={showHeaderSignIn && view !== 'signin'} 
        onSignInClick={() => setView('signin')} 
        onLogoClick={() => {
          setView('landing');
          setEmail('');
          setPassword('');
        }}
      />
      
      {view === 'landing' && (
        <LandingView 
          onGetStarted={handleGetStarted} 
          initialEmail={email} 
        />
      )}

      {view === 'signin' && (
        <SignInView 
          initialEmail={email} 
          onSignUpNow={() => setView('landing')} 
          onLoginSuccess={() => {}}
        />
      )}

      {view === 'signup_step1' && (
        <Step1Password 
          email={email} 
          onNext={handlePasswordNext} 
        />
      )}

      {view === 'signup_step2' && (
        <Step2Plan 
          initialPlan={plan} 
          initialBillingCycle={billingCycle} 
          onNext={handlePlanNext} 
        />
      )}

      {view === 'signup_step3' && (
        <Step3Payment 
          selectedPlan={plan} 
          billingCycle={billingCycle} 
          onSubmit={handlePaymentSubmit} 
          onBack={() => setView('signup_step1')} 
        />
      )}
    </div>
  );
}
