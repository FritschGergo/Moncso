import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Video, DollarSign, CheckCircle, XCircle, List } from 'lucide-react';
import { getCourses, saveCourse, deleteCourse, DynamicCourse } from '../lib/db';

interface AdminCoursesProps {
  onSelectCourse: (course: DynamicCourse) => void;
}

export default function AdminCourses({ onSelectCourse }: AdminCoursesProps) {
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<DynamicCourse>>({
    title: '',
    description: '',
    price: '',
    promoVideoUrl: '',
    popular: false,
    features: [],
    lessonCount: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCourse(currentCourse);
      setIsEditing(false);
      setCurrentCourse({
        title: '',
        description: '',
        price: '',
        promoVideoUrl: '',
        popular: false,
        features: [],
        lessonCount: 0
      });
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Hiba történt a mentés során.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a kurzust és az összes hozzá tartozó órát?")) {
      try {
        await deleteCourse(id);
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Hiba történt a törlés során.");
      }
    }
  };

  const handleEdit = (course: DynamicCourse) => {
    setCurrentCourse(course);
    setIsEditing(true);
  };

  if (loading && courses.length === 0) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Kurzusok Kezelése</h2>
        <button 
          onClick={() => {
            setCurrentCourse({
              title: '',
              description: '',
              price: '',
              promoVideoUrl: '',
              popular: false,
              features: [],
              lessonCount: 0
            });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 bg-primary text-text-dark px-4 py-2 rounded-lg font-bold hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Új Kurzus
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{currentCourse.id ? 'Kurzus Szerkesztése' : 'Új Kurzus Létrehozása'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kurzus Címe</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={currentCourse.title}
                  onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ár (pl. 14 990 Ft)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={currentCourse.price}
                  onChange={e => setCurrentCourse({...currentCourse, price: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leírás</label>
              <textarea 
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                value={currentCourse.description}
                onChange={e => setCurrentCourse({...currentCourse, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Videó URL (YouTube)</label>
              <input 
                type="url" 
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                value={currentCourse.promoVideoUrl}
                onChange={e => setCurrentCourse({...currentCourse, promoVideoUrl: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="popular"
                checked={currentCourse.popular}
                onChange={e => setCurrentCourse({...currentCourse, popular: e.target.checked})}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="popular" className="text-sm font-medium text-gray-700">Népszerű kurzus (kiemelt jelvény)</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jellemzők (vesszővel elválasztva)</label>
              <input 
                type="text" 
                placeholder="9 hetes tananyag, Videós leckék, Örökös hozzáférés"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                value={currentCourse.features?.join(', ')}
                onChange={e => setCurrentCourse({...currentCourse, features: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Mégse
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-primary text-text-dark font-bold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Mentés
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-text-dark">{course.title}</h3>
                {course.popular && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Népszerű</span>}
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <List className="w-4 h-4" />
                  <span>{course.lessonCount || 0} óra</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{course.price}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
              <button 
                onClick={() => onSelectCourse(course)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                <List className="w-4 h-4" />
                Órák
              </button>
              <button 
                onClick={() => handleEdit(course)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(course.id!)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
