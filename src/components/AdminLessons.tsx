import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Video, ArrowLeft, CheckCircle, XCircle, GripVertical } from 'lucide-react';
import { getLessonsByCourseId, saveLesson, deleteLesson, DynamicLesson, DynamicCourse } from '../lib/db';

interface AdminLessonsProps {
  course: DynamicCourse;
  onBack: () => void;
}

export default function AdminLessons({ course, onBack }: AdminLessonsProps) {
  const [lessons, setLessons] = useState<DynamicLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<DynamicLesson>>({
    courseId: course.id,
    order: 1,
    title: '',
    description: '',
    videoUrl: '',
    homeworkRequired: false,
    homeworkDescription: ''
  });

  useEffect(() => {
    fetchLessons();
  }, [course.id]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await getLessonsByCourseId(course.id!);
      setLessons(data);
      // Set default order for new lesson
      setCurrentLesson(prev => ({ ...prev, order: data.length + 1 }));
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveLesson(currentLesson);
      setIsEditing(false);
      setCurrentLesson({
        courseId: course.id,
        order: lessons.length + 1,
        title: '',
        description: '',
        videoUrl: '',
        homeworkRequired: false,
        homeworkDescription: ''
      });
      fetchLessons();
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Hiba történt a mentés során.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt az órát?")) {
      try {
        await deleteLesson(id);
        fetchLessons();
      } catch (error) {
        console.error("Error deleting lesson:", error);
        alert("Hiba történt a törlés során.");
      }
    }
  };

  const handleEdit = (lesson: DynamicLesson) => {
    setCurrentLesson(lesson);
    setIsEditing(true);
  };

  if (loading && lessons.length === 0) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{course.title} - Órák Kezelése</h2>
          <p className="text-sm text-text-muted">Kezeld a kurzus tananyagait és sorrendjét.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentLesson({
              courseId: course.id,
              order: lessons.length + 1,
              title: '',
              description: '',
              videoUrl: '',
              homeworkRequired: false,
              homeworkDescription: ''
            });
            setIsEditing(true);
          }}
          className="ml-auto flex items-center gap-2 bg-primary text-text-dark px-4 py-2 rounded-lg font-bold hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Új Óra
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{currentLesson.id ? 'Óra Szerkesztése' : 'Új Óra Létrehozása'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Óra Címe</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={currentLesson.title}
                  onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sorrend</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={currentLesson.order}
                  onChange={e => setCurrentLesson({...currentLesson, order: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leírás</label>
              <textarea 
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                value={currentLesson.description}
                onChange={e => setCurrentLesson({...currentLesson, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Videó URL (YouTube)</label>
              <input 
                type="url" 
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                value={currentLesson.videoUrl}
                onChange={e => setCurrentLesson({...currentLesson, videoUrl: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="homeworkRequired"
                checked={currentLesson.homeworkRequired}
                onChange={e => setCurrentLesson({...currentLesson, homeworkRequired: e.target.checked})}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="homeworkRequired" className="text-sm font-medium text-gray-700">Házi feladat szükséges ehhez az órához</label>
            </div>

            {currentLesson.homeworkRequired && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-1">Házi feladat leírása</label>
                <textarea 
                  rows={3}
                  placeholder="Írd le pontosan, mi a feladat..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={currentLesson.homeworkDescription || ''}
                  onChange={e => setCurrentLesson({...currentLesson, homeworkDescription: e.target.value})}
                />
              </div>
            )}
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="py-4 px-6 font-medium w-16 text-center">#</th>
              <th className="py-4 px-6 font-medium">Óra címe</th>
              <th className="py-4 px-6 font-medium">Videó</th>
              <th className="py-4 px-6 font-medium text-center">Házi feladat</th>
              <th className="py-4 px-6 font-medium text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map(lesson => (
              <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-center font-bold text-gray-400">
                  {lesson.order}.
                </td>
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-900">{lesson.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                </td>
                <td className="py-4 px-6">
                  {lesson.videoUrl ? (
                    <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
                      <Video className="w-4 h-4" />
                      Megtekintés
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Nincs videó</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {lesson.homeworkRequired ? (
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Szükséges</span>
                  ) : (
                    <span className="text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Nem kell</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(lesson)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(lesson.id!)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  Még nincsenek órák hozzáadva ehhez a kurzushoz.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
