import React, { useState } from 'react';
import { Building2, X, PackagePlus, CalendarClock, ChevronRight } from 'lucide-react';
import ComplaintForm from './ComplaintForm';
import LeaveRequestModal from './LeaveRequestModal';
import { User } from '../../types'; 

interface Props {
  user: User | null;
}

export default function InstituteServicesSidebar({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  if (!user) return null;

  // ✅ FIXED: Treat EVERYONE as a standard user who gets these features, 
  // EXCEPT the specifically restricted 'male_user'.
  const showFemaleFeatures = user.role !== 'male_user';

  const handlePadRequest = () => {
    alert("🚨 Emergency Sanitary Kit requested! \n\nPlease collect it from the campus medical room or your department office. \nDiscounted Cost: ₹5.");
  };

  return (
    <>
      {/* Floating Action Button (Matches your screenshot) */}
      <div className="fixed bottom-8 right-8 z-[90]">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0b5cbf] hover:bg-blue-800 text-white px-6 py-3.5 rounded-full font-bold shadow-xl shadow-blue-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Building2 size={20} /> Institute Services
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[95]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Building2 className="text-blue-600" size={20} /> Institute Services
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Official portal for requests & grievances.</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
          
          {/* Female User Specific Actions (Leave & Emergency Pad) */}
          {showFemaleFeatures && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Student Support</h3>
              
              {/* Emergency Pad Button */}
              <button 
                onClick={handlePadRequest}
                className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-100 p-4 rounded-2xl flex items-center justify-between text-left transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <PackagePlus size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Emergency Menstrual Kit</h4>
                    <p className="text-[11px] font-medium text-rose-600 mt-0.5">Request subsidized sanitary pads</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-rose-300 group-hover:text-rose-500" />
              </button>

              {/* Medical Leave Button */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setShowLeaveModal(true);
                }}
                className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between text-left transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Request Medical Leave</h4>
                    <p className="text-[11px] font-medium text-indigo-600 mt-0.5">Submit AI Health Assessment</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-indigo-300 group-hover:text-indigo-500" />
              </button>
            </div>
          )}

          {/* Grievance Section (Uses the ComplaintForm component we made earlier) */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Administration</h3>
            <div className="bg-slate-50 p-2 rounded-3xl border border-slate-100">
              <ComplaintForm />
            </div>
          </div>

        </div>
      </div>

      {/* Leave Request Modal overlay */}
      {showLeaveModal && (
        <LeaveRequestModal 
          onClose={() => setShowLeaveModal(false)} 
          userId={user.id} 
        />
      )}
    </>
  );
}