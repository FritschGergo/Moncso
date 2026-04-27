import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getUserCourses, UserCourse, getCourses, DynamicCourse } from '../lib/db';

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [availableDynamicCourses, setAvailableDynamicCourses] = useState<DynamicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uCourses, dCourses] = await Promise.all([
          user ? getUserCourses(user.uid) : Promise.resolve([]),
          getCourses()
        ]);
        setUserCourses(uCourses);
        setAvailableDynamicCourses(dCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePurchase = (courseId: string) => {
    if (!user) {
      alert("Kérlek jelentkezz be a vásárláshoz.");
      return;
    }
    navigate(`/checkout/${courseId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-text-muted hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza az irányítópultra
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Kurzusok vásárlása</h1>
          <p className="text-text-muted text-lg max-w-2xl">
            Fejleszd tovább tudásod és építs még erősebb kapcsolatot kedvenceddel prémium kurzusaink segítségével.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            availableDynamicCourses.map((course) => {
              const isPurchased = userCourses.some(uc => uc.courseId === course.id && uc.hasAccess);
              
              return (
              <div 
                key={course.id} 
                className={`bg-white rounded-2xl p-8 border transition-all duration-300 flex flex-col h-full relative ${
                  course.popular ? 'border-primary shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-primary/50'
                }`}
              >
                {course.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    LEGNÉPSZERŰBB
                  </div>
                )}
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-3">{course.title}</h2>
                  <p className="text-text-muted text-sm min-h-[60px]">
                    {course.description}
                  </p>
                </div>
                
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <span className="text-3xl font-bold">{course.price}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {course.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-gray-600 font-bold">{course.lessonCount || 0} videós óra</span>
                  </li>
                </ul>
                
                <button 
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                    isPurchased 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-text-dark hover:bg-primary-hover'
                  }`}
                  disabled={isPurchased}
                  onClick={() => handlePurchase(course.id!)}
                >
                  {isPurchased ? (
                    'Már megvásárolva'
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Megvásárolom
                    </>
                  )}
                </button>
              </div>
            )})
          )}
          
          {!loading && availableDynamicCourses.length === 0 && (
            <div className="col-span-full text-center py-20 text-text-muted">
              Jelenleg nincsenek elérhető kurzusok.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
