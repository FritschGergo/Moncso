import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { PawPrint, Mic, MicOff, Video, VideoOff, MonitorUp, Settings, PhoneOff, MoreVertical, ArrowUp } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [inCall, setInCall] = useState(false);
  const [message, setMessage] = useState('');

  const handleJoin = () => {
    setInCall(true);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-80px)] lg:h-screen">
        <header className="h-16 flex-none bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h1 className="font-bold text-lg tracking-tight">Konzultáció Dr. Whiskers-szel</h1>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-text-muted">
              3. alkalom: Bizalomépítés
            </span>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <section className="flex-1 flex flex-col p-4 lg:p-6 relative bg-gray-50 justify-center items-center">
            {!inCall ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Készen állsz a csatlakozásra?</h2>
                <button 
                  onClick={handleJoin}
                  className="px-8 py-4 bg-primary text-text-dark font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all hover:scale-105"
                >
                  Csatlakozás a híváshoz
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full max-h-[85vh] aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10">
                <JitsiMeeting
                  domain="meet.jit.si"
                  roomName={`PurrfectTherapy-Consultation-${id}`}
                  configOverwrite={{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                    startScreenSharing: true,
                    enableEmailInStats: false
                  }}
                  interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                  }}
                  userInfo={{
                    displayName: user?.email || 'Vendég',
                    email: user?.email || 'vendeg@example.com'
                  }}
                  onApiReady={(externalApi) => {
                    // Attach custom event listeners here
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                  }}
                />
              </div>
            )}
          </section>

          <aside className="w-80 lg:w-96 flex-none bg-white border-l border-gray-200 flex flex-col z-10">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="font-bold text-text-dark">Élő Konzultáció</h2>
              <button className="text-gray-400 hover:text-primary transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              <div className="flex justify-center my-4">
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">A konzultáció 10:00-kor kezdődött</span>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  Dr
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <span className="text-xs font-semibold text-text-muted ml-1">Dr. Whiskers</span>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-text-dark leading-relaxed">
                    Hogy reagál Folti azokra az új jutalomfalatokra, amikről legutóbb beszéltünk? 🐱
                  </div>
                  <span className="text-[10px] text-gray-400 ml-1">10:02</span>
                </div>
              </div>

              <div className="flex gap-3 flex-row-reverse">
                <div className="flex flex-col gap-1 items-end max-w-[85%]">
                  <div className="bg-primary/20 border border-primary/20 p-3 rounded-2xl rounded-tr-none text-sm text-text-dark leading-relaxed">
                    Sokkal jobban, ma már odajött hozzám! Nagyon meglepődtem.
                  </div>
                  <span className="text-[10px] text-gray-400 mr-1">10:04</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200 space-y-4">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tegye fel kérdését itt..." 
                  className="w-full bg-gray-50 border-none rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/50 text-text-dark placeholder-gray-400"
                />
                <button className="absolute right-2 p-1.5 rounded-full bg-primary text-text-dark hover:bg-primary-hover transition-colors">
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
