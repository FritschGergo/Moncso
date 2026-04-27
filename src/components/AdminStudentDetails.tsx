import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Calendar, ExternalLink, CheckCircle, Clock, FileText, PlayCircle, MessageSquare, Save, Lock, Edit2, X } from 'lucide-react';
import { UserProfile, UserCourse, DynamicCourse, DynamicLesson, getUserHomeworks, getLessonsByCourseId, Homework, updateHomeworkStatus, isLessonLocked, updateUserCourseEnrollmentDate } from '../lib/db';

interface AdminStudentDetailsProps {
  user: UserProfile & { courses: UserCourse[] };
  availableCourses: DynamicCourse[];
  onBack: () => void;
  onUpdate?: () => void;
}

interface EnrichedCourse extends UserCourse {
  details: DynamicCourse;
  lessons: DynamicLesson[];
  homeworks: Homework[];
}

export default function AdminStudentDetails({ user, availableCourses, onBack, onUpdate }: AdminStudentDetailsProps) {
  const [enrichedCourses, setEnrichedCourses] = useState<EnrichedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [savingFeedback, setSavingFeedback] = useState<Record<string, boolean>>({});
  const [editingEnrollment, setEditingEnrollment] = useState<string | null>(null);
  const [newEnrollmentDate, setNewEnrollmentDate] = useState<string>('');
  const [savingEnrollment, setSavingEnrollment] = useState(false);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const homeworks = await getUserHomeworks(user.uid);
      
      const enriched = await Promise.all(user.courses.map(async (uc) => {
        const courseDetails = availableCourses.find(c => c.id === uc.courseId);
        if (!courseDetails) return null;
        
        const lessons = await getLessonsByCourseId(uc.courseId);
        const courseHomeworks = homeworks.filter(h => h.courseId === uc.courseId);
        
        return {
          ...uc,
          details: courseDetails,
          lessons,
          homeworks: courseHomeworks
        };
      }));
      
      const filteredEnriched = enriched.filter(e => e !== null) as EnrichedCourse[];
      setEnrichedCourses(filteredEnriched);

      // Initialize feedback text state
      const initialFeedback: Record<string, string> = {};
      filteredEnriched.forEach(course => {
        course.homeworks.forEach(hw => {
          if (hw.id) initialFeedback[hw.id] = hw.feedback || '';
        });
      });
      setFeedbackText(initialFeedback);

    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user, availableCourses]);

  const handleSaveFeedback = async (homeworkId: string, status: 'approved' | 'rejected') => {
    setSavingFeedback(prev => ({ ...prev, [homeworkId]: true }));
    try {
      await updateHomeworkStatus(homeworkId, status, feedbackText[homeworkId]);
      alert("Értékelés sikeresen mentve!");
      // Refresh data
      await fetchStudentData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Hiba történt a mentés során.");
    } finally {
      setSavingFeedback(prev => ({ ...prev, [homeworkId]: false }));
    }
  };

  const handleUpdateEnrollment = async (courseId: string) => {
    if (!newEnrollmentDate) return;
    setSavingEnrollment(true);
    try {
      await updateUserCourseEnrollmentDate(user.uid, courseId, new Date(newEnrollmentDate));
      alert("Beiratkozási dátum sikeresen módosítva!");
      setEditingEnrollment(null);
      await fetchStudentData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating enrollment date:", error);
      alert("Hiba történt a módosítás során.");
    } finally {
      setSavingEnrollment(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '-';
    }
  };

  const getInputDateValue = (date: any) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a tanulókhoz
      </button>

      {/* Tanuló Alapadatok */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold">
          {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-text-dark mb-1">{user.displayName || 'Névtelen felhasználó'}</h2>
          <p className="text-text-muted mb-4">{user.email}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              Csatlakozott: {formatDate(user.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <Book className="w-4 h-4" />
              Kurzusok száma: {enrichedCourses.length}
            </div>
          </div>
        </div>
      </div>

      {/* Kurzusok és Házi Feladatok */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-text-dark">Kurzusok és Haladás</h3>
        
        {enrichedCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-text-muted">Ez a tanuló még nem iratkozott fel egyetlen kurzusra sem.</p>
          </div>
        ) : (
          enrichedCourses.map((course) => (
            <div key={course.courseId} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-text-dark">{course.details.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {editingEnrollment === course.courseId ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input 
                            type="datetime-local" 
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary outline-none"
                            value={newEnrollmentDate}
                            onChange={(e) => setNewEnrollmentDate(e.target.value)}
                          />
                          <button 
                            onClick={() => handleUpdateEnrollment(course.courseId)}
                            disabled={savingEnrollment}
                            className="p-1.5 bg-primary text-text-dark rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                            title="Mentés"
                          >
                            {savingEnrollment ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => setEditingEnrollment(null)}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Mégse"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Beiratkozott: {formatDate(course.enrolledAt)}
                          <button 
                            onClick={() => {
                              setEditingEnrollment(course.courseId);
                              setNewEnrollmentDate(getInputDateValue(course.enrolledAt));
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-primary transition-colors"
                            title="Dátum módosítása"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span>Haladás</span>
                      <span className="text-primary">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Leckék és beküldött házik</h5>
                <div className="space-y-4">
                  {course.lessons.map((lesson) => {
                    const homework = course.homeworks.find(h => h.lessonId === lesson.id);
                    const lockStatus = isLessonLocked(lesson, course.lessons, course, course.homeworks);
                    
                    return (
                      <div key={lesson.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-colors gap-4 ${lockStatus.locked ? 'bg-gray-50/50 border-gray-100 opacity-75' : 'border-gray-50 hover:border-primary/20'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${lockStatus.locked ? 'bg-gray-200 text-gray-400' : homework ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {lockStatus.locked ? <Lock className="w-5 h-5" /> : homework ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-text-dark">{lesson.order}. {lesson.title}</p>
                              {lockStatus.locked && (
                                <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Lock className="w-2 h-2" />
                                  ZÁRVA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">
                              {lockStatus.locked ? (
                                lockStatus.reason === 'time' ? (
                                  `Elérhető: ${formatDate(lockStatus.availableAt)}`
                                ) : (
                                  'Előző házi feladat hiányzik'
                                )
                              ) : (
                                lesson.homeworkRequired ? 'Házi feladat szükséges' : 'Nincs házi feladat'
                              )}
                            </p>
                          </div>
                        </div>

                        {lesson.homeworkRequired && (
                          <div className="flex flex-col gap-4 w-full md:w-auto">
                            {homework ? (
                              <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-3">
                                  <div className="text-xs text-right">
                                    <p className={`font-bold ${homework.status === 'approved' ? 'text-green-600' : homework.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`}>
                                      {homework.status === 'approved' ? 'Elfogadva' : homework.status === 'rejected' ? 'Elutasítva' : 'Beküldve'}
                                    </p>
                                    <p className="text-gray-400">{formatDate(homework.submittedAt)}</p>
                                  </div>
                                  <a 
                                    href={homework.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-all"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Drive Megnyitása
                                  </a>
                                </div>

                                {/* Feedback Section */}
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                                    <MessageSquare className="w-3 h-3" />
                                    Admin Értékelés
                                  </div>
                                  <textarea 
                                    rows={2}
                                    placeholder="Írj szöveges értékelést..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                    value={feedbackText[homework.id!] || ''}
                                    onChange={e => setFeedbackText({...feedbackText, [homework.id!]: e.target.value})}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleSaveFeedback(homework.id!, 'rejected')}
                                      disabled={savingFeedback[homework.id!]}
                                      className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      Elutasítás
                                    </button>
                                    <button 
                                      onClick={() => handleSaveFeedback(homework.id!, 'approved')}
                                      disabled={savingFeedback[homework.id!]}
                                      className="px-4 py-1.5 text-xs font-bold bg-primary text-text-dark hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                      {savingFeedback[homework.id! ] ? <Clock className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                      Elfogadás & Mentés
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Még nem küldte be
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
