import React from 'react';
import ProfileWidget from './ProfileWidget'; // Importing the widget we created earlier
import { Shield, Bell } from 'lucide-react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: The Interactive Profile Widget */}
        <div className="md:col-span-1">
          <ProfileWidget user={user} onUpdateUser={onUpdateUser} />
        </div>

        {/* Right Column: Additional Settings (Makes it feel like a complete page) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Security Section */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                <Shield size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Account Security</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Email</label>
                <p className="text-slate-800 font-medium mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block w-full">
                  {user.email || 'user@example.com'}
                </p>
              </div>
              <button className="bg-slate-100 text-slate-600 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors text-sm">
                Change Password
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-50 text-teal-500 rounded-2xl">
                <Bell size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <span className="text-slate-700 font-medium">Daily Health Reminders</span>
                <input type="checkbox" className="w-5 h-5 accent-rose-500" defaultChecked />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <span className="text-slate-700 font-medium">Monthly AI Report Alerts</span>
                <input type="checkbox" className="w-5 h-5 accent-rose-500" defaultChecked />
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;