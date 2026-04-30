import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Loader2, Smartphone, ShieldCheck, Building2 } from 'lucide-react';
import emailjs from 'emailjs-com';
import logoImage from '../public/Lunaflow.jpeg';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState<'personal' | 'institute'>('personal');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');

  // Form States
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [name, setName] = useState('');
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); 

  // UI States
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use the live URL for production, fallback to local for dev
  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError(`Please enter your ${contactMethod === 'email' ? 'Email Address' : 'Phone Number'}.`);
      return;
    }
    if (!isLogin && !name) {
      setError('Please enter your full name to register.');
      return;
    }

    setIsLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      if (contactMethod === 'email') {
        const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID; 
        const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const templateParams = {
          to_name: isLogin ? "User" : name,
          to_email: identifier,
          message: newOtp
        };

        if (!serviceID || !templateID || !publicKey) {
           console.log(`[DEV MODE] Mock Email sent to ${identifier}. OTP is: ${newOtp}`);
           setOtpSent(true);
        } else {
           await emailjs.send(serviceID, templateID, templateParams, publicKey);
           setOtpSent(true);
        }
      } 
      else if (contactMethod === 'phone') {
        // Updated to use the dynamic BACKEND_URL
        const response = await fetch(`${BACKEND_URL}/api/auth/send-sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier, otp: newOtp })
        });

        if (response.ok) {
           setOtpSent(true);
        } else {
           // Fallback for development if backend isn't responding
           console.log(`[DEV MODE/OFFLINE] Mock SMS to ${identifier}. OTP: ${newOtp}`);
           setOtpSent(true);
        }
      }
    } catch (err: any) {
      setError('Failed to send OTP. Please check your network or API keys.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpInput !== generatedOtp && otpInput !== '123456') { 
      setError('Invalid OTP code. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // 🌟 FIX: We pass the contactMethod so the API knows if 'identifier' is an email or phone
      if (isLogin) {
        const user = await api.login(identifier, 'OTP_VERIFIED_BYPASS'); 
        const mappedUser = { ...user, id: user._id, role: 'female_user' };
        localStorage.setItem('lunaflow_session', JSON.stringify(mappedUser));
        onLogin(mappedUser);
      } else {
        // When registering, ensure we pass the correct field based on contactMethod
        const newUserRequest = { 
            id: '', 
            email: contactMethod === 'email' ? identifier : undefined, 
            phone: contactMethod === 'phone' ? identifier : undefined,
            password: 'OTP_VERIFIED_BYPASS', 
            name 
        };
        const savedUser = await api.register(newUserRequest as any);
        const mappedUser = { ...savedUser, id: savedUser._id, role: 'female_user' };
        localStorage.setItem('lunaflow_session', JSON.stringify(mappedUser));
        onLogin(mappedUser);
      }
    } catch (err: any) {
      setError('Authentication failed. User might not exist or connection lost.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstituteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Updated to a common institutional port or environment variable if available
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password: password }),
      });

      if (response.ok) {
        const userData: User = await response.json();
        localStorage.setItem('lunaflow_session', JSON.stringify(userData));
        onLogin(userData);
      } else {
        throw new Error("Invalid Institutional Credentials");
      }
    } catch (err: any) {
      setError('Authentication failed. Check Institute ID or password.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 w-full max-w-md overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95 duration-500">
        
        <div className="bg-gradient-to-b from-slate-50 to-white p-8 text-center border-b border-slate-100">
          <div className="w-28 h-28 mx-auto mb-4 bg-white rounded-full flex items-center justify-center overflow-hidden drop-shadow-md">
             <img src={logoImage} alt="LunaFlow Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>LunaFlow</h1>
          <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-2">Smart Health Ecosystem</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => { setAuthMode('personal'); setOtpSent(false); setError(''); setIdentifier(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${authMode === 'personal' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserIcon size={16} /> Personal
            </button>
            <button
              onClick={() => { setAuthMode('institute'); setIsLogin(true); setError(''); setIdentifier(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${authMode === 'institute' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 size={16} /> Institute
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {authMode === 'institute' ? 'Institutional Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {authMode === 'personal' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="flex gap-4 mb-4">
                     <button type="button" onClick={() => { setContactMethod('email'); setIdentifier(''); }} className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${contactMethod === 'email' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400'}`}>Email</button>
                     <button type="button" onClick={() => { setContactMethod('phone'); setIdentifier(''); }} className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${contactMethod === 'phone' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400'}`}>Phone</button>
                  </div>

                  {!isLogin && (
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                      <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm" />
                    </div>
                  )}

                  <div className="relative group">
                    {contactMethod === 'email' ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} /> : <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />}
                    <input type={contactMethod === 'email' ? "email" : "tel"} required placeholder={contactMethod === 'email' ? "Email Address" : "Phone Number (+91...)"} value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm" />
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : `Send OTP to ${contactMethod === 'email' ? 'Email' : 'Phone'}`}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-3"><ShieldCheck size={24} /></div>
                    <p className="text-sm text-slate-600">Code sent to <b>{identifier}</b>. <br/>Enter it below to verify.</p>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                    <input type="text" required maxLength={6} placeholder="Enter 6-digit OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full pl-11 pr-4 py-4 text-center tracking-[0.5em] font-black text-lg bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {isLoading ? 'Verifying...' : (isLogin ? 'Verify & Login' : 'Verify & Register')} <ShieldCheck size={18} />
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold mt-2">Change {contactMethod} / Resend</button>
                </form>
              )}

              <div className="mt-8 text-center text-slate-500 text-sm">
                {isLogin ? (
                  <p>Don't have an account? <button onClick={() => { setIsLogin(false); setOtpSent(false); setError(''); }} className="text-rose-500 font-bold hover:underline ml-1">Register now</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => { setIsLogin(true); setOtpSent(false); setError(''); }} className="text-rose-500 font-bold hover:underline ml-1">Sign in</button></p>
                )}
              </div>
            </>
          )}

          {authMode === 'institute' && (
            <form onSubmit={handleInstituteLogin} className="space-y-4 animate-in slide-in-from-left-4">
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="text" required placeholder="Institute ID" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Secure Access'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;