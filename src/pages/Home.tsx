import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Video, ArrowRight, CheckCircle2, Star, Users, Play, Heart, BookOpen, ClipboardList, Facebook, Instagram } from 'lucide-react';
import { getCourses, DynamicCourse } from '../lib/db';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
  return (
    <div className="bg-bg-light text-text-dark font-sans antialiased min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-light/90 backdrop-blur-md border-b border-gray-200 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <PawPrint className="text-primary w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-text-dark">Macska<span className="text-primary">Terápia</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-text-muted hover:text-primary font-medium transition-colors">Rólam</a>
              <a href="#workshops" className="text-text-muted hover:text-primary font-medium transition-colors">Kurzusok</a>
              <a href="#" className="text-text-muted hover:text-primary font-medium transition-colors">Sikertörténetek</a>
            </div>
            <div className="hidden md:flex items-center">
              {user ? (
                <Link to={profile?.role === 'admin' ? "/admin" : "/dashboard"} className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-text-dark bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/20">
                  {profile?.role === 'admin' ? 'Admin Pult' : 'Irányítópult'}
                </Link>
              ) : (
                <Link to="/login" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-text-dark bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/20">
                  Bejelentkezés
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-bg-light">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-emerald-800 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Új workshopok elérhetőek
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-text-dark tracking-tight mb-6 leading-[1.1]">
                Értse meg<br/>
                macskáját,<br/>
                <span className="text-primary">Gyógyuljanak<br/>együtt.</span>
              </h1>
              <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
                Segítsünk kedvencének a harmónia megtalálásában. Csatlakozzon szakértők által vezetett workshopjainkhoz és videókonzultációinkhoz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#workshops" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-text-dark bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5">
                  Kurzusok Böngészése
                </a>
              </div>
              <div className="mt-10 pt-8 flex flex-wrap gap-8 items-center text-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Állatorvos által hitelesített</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">500+ Boldog Macska</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">4.9/5 Értékelés</span>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-emerald-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-[4/3]">
                <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=2043&ixlib=rb-4.0.3" alt="Cat" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                  <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-primary ml-1 fill-current" />
                  </button>
                </div>
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-4 animate-bounce-slow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-orange-500 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">HANGULATJAVÍTÓ</p>
                    <p className="text-sm font-bold text-text-dark">Azonnali Enyhülés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section id="workshops" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">TERÁPIÁS ÜLÉSEK</span>
            <h2 className="mt-2 text-3xl font-extrabold text-text-dark sm:text-4xl">Macskaterápia Workshopok</h2>
            <p className="mt-4 text-lg text-text-muted">Saját tempóban végezhető videókurzusok, amelyek gyengéd, bevált módszerekkel kezelik a viselkedési problémákat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="bg-bg-light rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden bg-slate-200">
                    {/* Fallback image or use a property if added later */}
                    <img 
                      src={`https://picsum.photos/seed/${course.id}/800/600`} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-text-dark shadow-sm">
                      {course.lessonCount || 0} Óra
                    </div>
                    {course.popular && (
                      <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-text-dark shadow-sm uppercase">
                        Népszerű
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Kurzus</span>
                      <span className="flex items-center text-xs font-medium text-text-muted">
                        <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-current" /> 5.0
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-text-dark mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">LEÍRÁS</p>
                    <p className="text-text-muted text-sm mb-8 flex-1 leading-relaxed line-clamp-3">{course.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <span className="text-2xl font-bold text-text-dark">{course.price}</span>
                      <Link 
                        to={`/checkout/${course.id}`}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-primary hover:border-primary transition-all group/btn"
                      >
                        <ArrowRight className="w-5 h-5 text-text-muted group-hover/btn:text-text-dark" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {!loading && courses.length === 0 && (
              <div className="col-span-full text-center py-20 text-text-muted">
                Jelenleg nincsenek elérhető kurzusok.
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-sm font-bold rounded-full text-text-dark bg-white hover:bg-gray-50 transition-all shadow-sm">
              Összes Workshop Megtekintése
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-bg-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-emerald-400 rounded-[3rem] blur-xl opacity-20"></div>
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5]">
                <img src="https://images.unsplash.com/photo-1527414368115-f62051964b55?auto=format&fit=crop&q=80&w=2070" alt="Woman with cat" className="w-full h-full object-cover" />
                
                {/* Floating Card */}
                <div className="absolute bottom-8 right-8 bg-white rounded-2xl p-5 shadow-xl flex items-center gap-4 max-w-[280px]">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-dark">Szakértői Útmutatás</p>
                    <p className="text-xs text-text-muted mt-1 leading-tight">Csapatunk okleveles viselkedéskutatókból és macskapszichológusokból áll.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">MIÉRT VÁLASSZA A MACSKATERÁPIÁT?</span>
              <h2 className="mt-4 text-4xl lg:text-5xl font-extrabold text-text-dark leading-tight mb-6">
                Tudományosan Alapozott Módszerek, Szeretettel Átadva.
              </h2>
              <p className="text-lg text-text-muted mb-10 leading-relaxed">
                Nem csak "megjavítjuk" a problémákat; segítünk megérteni a *miértet* macskája viselkedése mögött. Megközelítésünk tartós változásokat hoz stressz nélkül.
              </p>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-dark mb-2">Strukturált Tananyag</h3>
                    <p className="text-text-muted leading-relaxed">Lépésről lépésre felépített videómodulok, amelyek megkönnyítik a tanulást Önnek és macskájának.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-dark mb-2">Házi Feladat & Követés</h3>
                    <p className="text-text-muted leading-relaxed">Töltsön fel haladási videókat a szakértőinktől kapott személyre szabott visszajelzésért.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <PawPrint className="text-primary w-8 h-8" />
                <span className="font-bold text-xl tracking-tight text-text-dark">Macska<span className="text-primary">Terápia</span></span>
              </div>
              <p className="text-text-muted mb-8 max-w-sm leading-relaxed">
                Tegyük jobbá a világot, egy dorombolással egyszerre. Professzionális útmutatás macskája életének minden szakaszához.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-bg-light flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-text-dark mb-6 tracking-wider text-sm uppercase">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Workshopok</a></li>
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Sikertörténetek</a></li>
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Árazás</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-text-dark mb-6 tracking-wider text-sm uppercase">Cégünk</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Rólunk</a></li>
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Szakértőink</a></li>
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Karrier</a></li>
                <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Kapcsolat</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-text-dark mb-6 tracking-wider text-sm uppercase">Maradjon Kapcsolatban</h4>
              <p className="text-text-muted text-sm mb-4 leading-relaxed">Kapja meg a legfrissebb macskagondozási tippeket közvetlenül a postaládájába.</p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Adja meg az email címét" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                <button 
                  type="submit" 
                  className="w-full px-4 py-3 rounded-xl bg-text-dark text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  Feliratkozás
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-sm">© 2023 MacskaTerápia Kft. Minden jog fenntartva.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-text-muted text-sm hover:text-primary transition-colors">Adatvédelmi Irányelvek</Link>
              <Link to="/terms" className="text-text-muted text-sm hover:text-primary transition-colors">Felhasználási Feltételek</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
