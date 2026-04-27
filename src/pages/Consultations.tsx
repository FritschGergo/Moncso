import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Users, User, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function Consultations() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Konzultációk</h1>
          <p className="text-gray-500 text-lg">Vegyél részt csoportos alkalmainkon, vagy foglalj egyéni időpontot.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Group Consultation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Users className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Következő Csoportos Konzultáció</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Csatlakozz a heti csoportos konzultációnkhoz, ahol közösen beszéljük át a felmerülő kérdéseket és tapasztalatokat.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">2026. Március 5., Csütörtök</span>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">18:00 - 19:00</span>
              </div>
            </div>
            
            <Link 
              to="/consultation/1" 
              className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-primary text-text-dark font-bold rounded-xl shadow-sm hover:bg-primary-hover transition-all"
            >
              <Video className="w-5 h-5" />
              Csatlakozás a híváshoz
            </Link>
          </div>

          {/* Individual Consultation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <User className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Egyéni Konzultáció Foglalás</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Személyre szabott segítségre van szükséged? Foglalj egy 45 perces egyéni konzultációt szakértőnkkel.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-600">Személyre szabott viselkedésterápia</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-600">Konkrét problémák célzott kezelése</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-600">Rugalmas időpontválasztás</span>
              </div>
            </div>
            
            <button 
              className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-sm hover:bg-gray-800 transition-all"
              onClick={() => alert('Időpontfoglaló rendszer hamarosan...')}
            >
              Időpontot foglalok
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
