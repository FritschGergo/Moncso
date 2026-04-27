import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { PawPrint, LayoutDashboard, BookOpen, Upload, Video, Menu, Trophy, Lock, PlayCircle, CheckCircle, ChevronDown, ChevronRight, ChevronLeft, ShoppingCart, Book, Users } from 'lucide-react';
import { getUserCourses, UserCourse, getCourseById, getLessonsByCourseId, DynamicLesson, isLessonLocked, getUserHomeworks, Homework } from '../lib/db';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<(UserCourse & { title: string; lessons: (DynamicLesson & { isLocked: boolean })[] })[]>([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (user) {
        try {
          const [courses, homeworks] = await Promise.all([
            getUserCourses(user.uid),
            getUserHomeworks(user.uid)
          ]);
          
          const activeCourses = courses.filter(c => c.hasAccess);
          
          const enriched = await Promise.all(activeCourses.map(async (c) => {
            const details = await getCourseById(c.courseId);
            const lessons = await getLessonsByCourseId(c.courseId);
            
            const lessonsWithLockStatus = lessons.map(lesson => {
              const lockStatus = isLessonLocked(lesson, lessons, c, homeworks);
              return { ...lesson, isLocked: lockStatus.locked };
            });

            return { 
              ...c, 
              title: details?.title || 'Ismeretlen kurzus',
              lessons: lessonsWithLockStatus
            };
          }));
          
          setEnrolledCourses(enriched as any);
        } catch (error) {
          console.error("Error fetching enrolled courses:", error);
        }
      }
    };

    fetchEnrolledCourses();
  }, [user, location.pathname]); // Re-fetch when path changes to update lock status if homework was just uploaded

  return (
    <div className="font-sans bg-bg-light text-text-dark min-h-screen flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex-shrink-0 fixed h-full z-30 flex flex-col justify-between transition-all duration-300 
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 relative">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-text-dark flex-shrink-0">
                <PawPrint className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">PurrfectMind</span>
            </div>
            {!isSidebarOpen && (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-text-dark flex-shrink-0 mx-auto">
                <PawPrint className="w-6 h-6" />
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 absolute -right-3 top-6 bg-white border border-gray-200 shadow-sm z-40"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-muted hover:bg-gray-50 hover:text-primary group'}`} 
              title="Áttekintés"
            >
              <LayoutDashboard className={`w-5 h-5 flex-shrink-0 ${location.pathname === '/dashboard' ? '' : 'group-hover:text-primary transition-colors'}`} />
              {isSidebarOpen && <span>Áttekintés</span>}
            </Link>
            
            <Link 
              to="/courses" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/courses' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-muted hover:bg-gray-50 hover:text-primary group'}`} 
              title="Kurzusok vásárlása"
            >
              <ShoppingCart className={`w-5 h-5 flex-shrink-0 ${location.pathname === '/courses' ? '' : 'group-hover:text-primary transition-colors'}`} />
              {isSidebarOpen && <span className="whitespace-nowrap">Kurzusok vásárlása</span>}
            </Link>
            
            <div>
              <button 
                onClick={() => {
                  if (!isSidebarOpen) setIsSidebarOpen(true);
                  setIsCoursesExpanded(!isCoursesExpanded);
                }} 
                className="w-full flex items-center justify-between px-4 py-3 text-text-muted hover:bg-gray-50 hover:text-primary rounded-lg transition-colors group"
                title="Meglévő kurzusaim"
              >
                <div className="flex items-center gap-3">
                  <Book className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
                  {isSidebarOpen && <span className="whitespace-nowrap">Meglévő kurzusaim</span>}
                </div>
                {isSidebarOpen && (
                  isCoursesExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
              
              {isSidebarOpen && isCoursesExpanded && (
                <div className="ml-4 mt-1 pl-4 border-l-2 border-gray-100 space-y-1">
                  {enrolledCourses.map(course => (
                    <div key={course.courseId} className="mb-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2">{course.title}</div>
                      {course.lessons && course.lessons.length > 0 ? (
                        course.lessons.map(lesson => (
                          <div className={`flex items-center gap-2 py-1.5 text-sm truncate pr-2 ${lesson.isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-primary cursor-pointer'} ${location.pathname === `/course/${course.courseId}/${lesson.id}` ? 'text-primary font-semibold' : ''}`}>
                            {lesson.isLocked ? (
                              <Lock className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="w-3 h-3 flex-shrink-0" />
                            )}
                            {lesson.isLocked ? (
                              <span title="Ez az óra még zárva van.">{lesson.order}. Óra: {lesson.title}</span>
                            ) : (
                              <Link 
                                to={`/course/${course.courseId}/${lesson.id}`} 
                                className="truncate"
                                title={`${lesson.order}. Óra: ${lesson.title}`}
                              >
                                {lesson.order}. Óra: {lesson.title}
                              </Link>
                            )}
                          </div>
                        ))
                      ) : (
                        <Link 
                          to={`/course/${course.courseId}`} 
                          className={`block py-1.5 text-sm truncate pr-2 text-gray-600 hover:text-primary ${location.pathname === `/course/${course.courseId}` ? 'text-primary font-semibold' : ''}`}
                        >
                          Kurzus megnyitása
                        </Link>
                      )}
                    </div>
                  ))}
                  {enrolledCourses.length === 0 && (
                    <div className="text-xs text-gray-400 py-2 italic">Nincs aktív kurzusod</div>
                  )}
                </div>
              )}
            </div>

            <Link 
              to="/consultations" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith('/consultation') ? 'bg-primary/10 text-primary font-semibold' : 'text-text-muted hover:bg-gray-50 hover:text-primary group'}`} 
              title="Konzultáció"
            >
              <Video className={`w-5 h-5 flex-shrink-0 ${location.pathname.startsWith('/consultation') ? '' : 'group-hover:text-primary transition-colors'}`} />
              {isSidebarOpen && <span>Konzultáció</span>}
            </Link>

            {user && profile?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-primary/10 text-primary font-semibold' : 'text-text-muted hover:bg-gray-50 hover:text-primary group'}`} 
                title="Adminisztráció"
              >
                <Users className={`w-5 h-5 flex-shrink-0 ${location.pathname === '/admin' ? '' : 'group-hover:text-primary transition-colors'}`} />
                {isSidebarOpen && <span>Adminisztráció</span>}
              </Link>
            )}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center px-0'}`} onClick={() => auth?.signOut()} title="Kijelentkezés">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{user?.email}</span>
                <span className="text-xs text-text-muted">Kijelentkezés</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} flex flex-col min-h-screen overflow-x-hidden`}>
        <div className="lg:hidden flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-text-dark">
              <PawPrint className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg">PurrfectMind</span>
          </div>
          <button 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
