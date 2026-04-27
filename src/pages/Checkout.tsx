import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollUserInCourse, getCourseById, DynamicCourse } from '../lib/db';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<DynamicCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const [billingData, setBillingData] = useState({
    fullName: '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    taxId: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const data = await getCourseById(id);
        if (!data) {
          navigate('/courses');
          return;
        }
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        navigate('/courses');
      } finally {
        setFetching(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setLoading(true);
    try {
      // Simulate a small delay for "payment processing"
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Real enrollment in the database
      await enrollUserInCourse(user.uid, id);
      
      setSuccess(true);
      // After 3 seconds redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Hiba történt a fizetés során. Kérlek próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Sikeres vásárlás! 🎉</h1>
          <p className="text-text-muted text-lg max-w-md mb-8">
            Köszönjük a bizalmad! A(z) <span className="font-bold text-text-dark">"{course?.title}"</span> kurzus mostantól elérhető számodra az irányítópulton.
          </p>
          <p className="text-sm text-gray-400">Pár másodpercen belül átirányítunk...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/courses" className="inline-flex items-center text-text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a kurzusokhoz
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Billing Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-8">Számlázási adatok</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Teljes név</label>
                  <input 
                    required
                    type="text" 
                    name="fullName"
                    value={billingData.fullName}
                    onChange={handleInputChange}
                    placeholder="Minta János"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Email cím</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={billingData.email}
                    onChange={handleInputChange}
                    placeholder="janos@pelda.hu"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Cím (utca, házszám)</label>
                <input 
                  required
                  type="text" 
                  name="address"
                  value={billingData.address}
                  onChange={handleInputChange}
                  placeholder="Macska utca 12."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Város</label>
                  <input 
                    required
                    type="text" 
                    name="city"
                    value={billingData.city}
                    onChange={handleInputChange}
                    placeholder="Budapest"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Irányítószám</label>
                  <input 
                    required
                    type="text" 
                    name="zipCode"
                    value={billingData.zipCode}
                    onChange={handleInputChange}
                    placeholder="1234"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-dark uppercase tracking-wider">Adószám (opcionális)</label>
                <input 
                  type="text" 
                  name="taxId"
                  value={billingData.taxId}
                  onChange={handleInputChange}
                  placeholder="12345678-1-12"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-text-dark font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-text-dark border-t-transparent rounded-full animate-spin"></div>
                      Feldolgozás...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Fizetés és kurzus aktiválása
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                  Biztonságos fizetés és adattárolás
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold mb-6">Rendelés összesítése</h2>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight mb-1">{course?.title}</h3>
                  <p className="text-xs text-text-muted">Online videókurzus</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Kurzus ára:</span>
                  <span className="font-medium">{course?.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Kedvezmény:</span>
                  <span className="text-green-500">0 Ft</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                <span className="font-bold">Összesen:</span>
                <span className="text-2xl font-extrabold text-primary">{course?.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
