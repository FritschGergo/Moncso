import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock, PlayCircle, CheckCircle, BookOpen, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getUserCourses, UserCourse, getCourseById, getLessonsByCourseId, DynamicCourse, DynamicLesson, getUserHomeworks, Homework, isLessonLocked } from '../lib/db';

interface EnrichedCourse extends UserCourse {
  details: DynamicCourse;
  lessons: DynamicLesson[];
  homeworks: Homework[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrichedCourses, setEnrichedCourses] = useState<EnrichedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        try {
          const courses = await getUserCourses(user.uid);
          const activeCourses = courses.filter(c => c.hasAccess);
          
          const enriched = await Promise.all(activeCourses.map(async (c) => {
            const details = await getCourseById(c.courseId);
            const lessons = await getLessonsByCourseId(c.courseId);
            const homeworks = await getUserHomeworks(user.uid, c.courseId);
            return { 
              ...c, 
              details: details!,
              lessons: lessons,
              homeworks: homeworks
            };
          }));
          
          setEnrichedCourses(enriched.filter(e => e.details) as any);
        } catch (error) {
          console.error("Error fetching user courses:", error);
        }
      }
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

  const formatDate = (date: any) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-10 flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Üdv újra{user?.displayName ? `, ${user.displayName}` : ''}! 🐾</h1>
            <p className="text-text-muted">
              {enrichedCourses.length > 0 
                ? 'Folytasd a tanulást a kurzusaiddal.' 
                : 'Jelenleg nincs aktív kurzusod.'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">Aktív kurzusok</p>
                <p className="font-bold text-sm">{enrichedCourses.length} db</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-12">
          {enrichedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Még nincsenek kurzusaid</h2>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                Nézz szét a kurzusaink között, és kezdd el a tanulást még ma, hogy jobban megértsd kedvencedet!
              </p>
              <Link to="/courses" className="inline-block bg-primary text-text-dark font-bold py-3 px-8 rounded-xl hover:bg-primary-hover transition-colors">
                Kurzusok felfedezése
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {enrichedCourses.map(course => {
                // Find the "most current" lesson: first unlocked that is not approved
                const lessonsWithStatus = course.lessons.map(lesson => ({
                  ...lesson,
                  lockStatus: isLessonLocked(lesson, course.lessons, course, course.homeworks),
                  homework: course.homeworks.find(h => h.lessonId === lesson.id)
                }));

                const firstUnlockedNotApproved = lessonsWithStatus.find(l => !l.lockStatus.locked && l.homework?.status !== 'approved');
                const lastUnlocked = [...lessonsWithStatus].reverse().find(l => !l.lockStatus.locked);
                const currentLessonId = firstUnlockedNotApproved?.id || lastUnlocked?.id;

                return (
                  <div key={course.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full mb-3">
                          <Trophy className="w-3 h-3" />
                          AKTÍV KURZUS
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-text-dark">{course.details.title}</h2>
                        <p className="text-text-muted max-w-2xl text-lg">
                          {course.details.description}
                        </p>
                      </div>
                      <div className="w-full md:w-64 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2 text-sm font-bold">
                          <span className="text-text-muted">Haladás</span>
                          <span className="text-primary">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessonsWithStatus.map((lesson) => {
                          const isCurrent = lesson.id === currentLessonId;
                          const isLocked = lesson.lockStatus.locked;
                          const isCompleted = lesson.homework?.status === 'approved';

                          return (
                            <div key={lesson.id} className="relative group">
                              {isCurrent && !isLocked && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-primary text-text-dark text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                                  MOST EZ KÖVETKEZIK! 🚀
                                </div>
                              )}
                              
                              <Link 
                                to={isLocked ? '#' : `/course/${course.courseId}/${lesson.id}`}
                                onClick={(e) => isLocked && e.preventDefault()}
                                className={`flex flex-col h-full bg-white border-2 rounded-2xl p-6 transition-all duration-300 ${
                                  isLocked 
                                    ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-75' 
                                    : isCurrent 
                                      ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02] ring-4 ring-primary/5' 
                                      : 'border-gray-100 hover:border-primary/40 hover:shadow-lg'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                                    isLocked ? 'bg-gray-200 text-gray-500' : isCurrent ? 'bg-primary text-text-dark' : 'bg-primary/10 text-primary'
                                  }`}>
                                    {lesson.order}. ÓRA
                                  </span>
                                  {isLocked ? (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  ) : isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <PlayCircle className={`w-5 h-5 ${isCurrent ? 'text-primary' : 'text-gray-300 group-hover:text-primary transition-colors'}`} />
                                  )}
                                </div>
                                
                                <h3 className={`font-bold text-xl mb-3 leading-tight ${isLocked ? 'text-gray-400' : 'text-text-dark'}`}>
                                  {lesson.title}
                                </h3>
                                
                                <p className={`text-sm mb-6 line-clamp-2 ${isLocked ? 'text-gray-400' : 'text-text-muted'}`}>
                                  {lesson.description}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                  {isLocked ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                      {lesson.lockStatus.reason === 'time' ? (
                                        <>
                                          <Clock className="w-3 h-3" />
                                          Elérhető: {formatDate(lesson.lockStatus.availableAt)}
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-3 h-3" />
                                          Előző házi hiányzik
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className={`flex items-center font-bold text-sm ${isCurrent ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'}`}>
                                      {isCompleted ? 'Megtekintés' : 'Lecke indítása'}
                                      <PlayCircle className="w-4 h-4 ml-1.5" />
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-6 flex justify-end">
                        <Link 
                          to={`/course/${course.courseId}`}
                          className="inline-flex items-center gap-2 bg-primary text-text-dark font-bold py-3 px-8 rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                        >
                          <PlayCircle className="w-5 h-5" />
                          Kurzus megnyitása
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

