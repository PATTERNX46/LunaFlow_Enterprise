import React, { useState } from 'react';
import { User as UserIcon, Edit2, Check, X, MapPin, Search, Loader2 } from 'lucide-react';
import { User } from '../types';

interface ProfileWidgetProps {
  user: User;
  onUpdateUser?: (updatedUser: User) => void;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ user, onUpdateUser }) => {
  // State to toggle between View and Edit modes
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States - Initialize with existing data or defaults
  const [age, setAge] = useState(user?.profile?.age || 25);
  const [location, setLocation] = useState(user?.profile?.location || '');

  // Handle saving the updated profile to the backend
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.id || (user as any)._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...user.profile,
            age: age,
            location: location,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the global state in App.tsx
        if (onUpdateUser) {
          onUpdateUser({ ...user, profile: data.profile });
        }
        setIsEditing(false); // Switch back to view mode
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative transition-all duration-300">
      
      {/* 🌟 Toggle Button: Edit / Cancel */}
      <button
        onClick={() => {
          setIsEditing(!isEditing);
          if (isEditing) {
            // Reset to original values if canceling
            setAge(user?.profile?.age || 25);
            setLocation(user?.profile?.location || '');
          }
        }}
        className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 transition-colors p-1"
      >
        {isEditing ? <X size={18} /> : <Edit2 size={18} />}
      </button>

      {/* 🌟 Avatar and Identity */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shrink-0">
          <UserIcon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            {user?.name || 'User'}
          </h3>
          
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                min="10"
                max="100"
              />
              <span className="text-sm text-slate-500">years old</span>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-0.5">{age} years old</p>
          )}
        </div>
      </div>

      {/* 🌟 Location and Actions Section */}
      <div className="pt-2 border-t border-slate-50 mt-2">
        {isEditing ? (
          /* === EDIT MODE UI === */
          <div className="space-y-4 animate-in slide-in-from-bottom-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <MapPin size={14} /> Update Home Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g. Kolkata, WB"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
            </div>
            
            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-200 disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Save Profile</>}
            </button>
          </div>
        ) : (
          /* === VIEW MODE UI (Your original design) === */
          <div className="space-y-3 animate-in fade-in">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> Location Insights
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={location || 'No location set'}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-600 italic"
              />
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-rose-500 text-white p-2.5 rounded-xl hover:bg-rose-600 transition-colors shrink-0 shadow-sm shadow-rose-200"
              >
                <Search size={18} />
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center">
              Click the edit icon above to change your default details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWidget;