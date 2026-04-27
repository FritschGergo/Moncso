import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, BookOpen, Search, Filter, MoreVertical, Edit2, Trash2, CheckCircle, XCircle, Layout, Settings, FileText, AlertCircle, Clock } from 'lucide-react';
import { getAllUsersWithCourses, toggleUserCourseAccess, UserProfile, UserCourse, DynamicCourse, getCourses, getAllPendingHomeworks, Homework, deleteUserProfile } from '../lib/db';
import AdminCourses from '../components/AdminCourses';
import AdminLessons from '../components/AdminLessons';
import AdminStudentDetails from '../components/AdminStudentDetails';

type UserWithCourses = UserProfile & { courses: UserCourse[] };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  const [selectedCourse, setSelectedCourse] = useState<DynamicCourse | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithCourses | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserWithCourses[]>([]);
  const [availableDynamicCourses, setAvailableDynamicCourses] = useState<DynamicCourse[]>([]);
  const [pendingHomeworks, setPendingHomeworks] = useState<Homework[]>([]);
  const [filterPending, setFilterPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserWithCourses | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [usersData, coursesData, pendingData] = await Promise.all([
        getAllUsersWithCourses(),
        getCourses(),
        getAllPendingHomeworks()
      ]);
      setUsers(usersData);
      setAvailableDynamicCourses(coursesData);
      setPendingHomeworks(pendingData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUserProfile(userToDelete.uid);
      setUsers(users.filter(u => u.uid !== userToDelete.uid));
      setUserToDelete(null);
      alert("Tanuló sikeresen törölve.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Hiba történt a törlés során.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPending) {
      const hasPending = pendingHomeworks.some(hw => hw.userId === user.uid);
      return matchesSearch && hasPending;
    }
    
    return matchesSearch;
  });

  const handleToggleCourseAccess = async (userId: string, courseId: string, currentAccess: boolean) => {
    try {
      await toggleUserCourseAccess(userId, courseId, !currentAccess);
      
      // Update local state
      setUsers(users.map(user => {
        if (user.uid === userId) {
          // If the user doesn't have the course in local state yet, add it
          const hasCourse = user.courses.some(c => c.courseId === courseId);
          let newCourses = [...user.courses];
          
          if (!hasCourse) {
            newCourses.push({
              userId,
              courseId,
              hasAccess: !currentAccess,
              progress: 0,
              enrolledAt: new Date()
            });
          } else {
            newCourses = user.courses.map(course => {
              if (course.courseId === courseId) {
                return { ...course, hasAccess: !currentAccess };
              }
              return course;
            });
          }
          
          return { ...user, courses: newCourses };
        }
        return user;
      }));
    } catch (error) {
      console.error("Error toggling course access:", error);
      alert("Hiba történt a hozzáférés módosításakor.");
    }
  };

  // Helper to get course data for a user
  const getCourseData = (user: UserWithCourses, courseId: string) => {
    const course = user.courses.find(c => c.courseId === courseId);
    return course || { hasAccess: false, progress: 0 };
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
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Adminisztrációs Pult ⚙️</h1>
          <p className="text-text-muted">Kezeld a tanulókat, a kurzusokhoz való hozzáférést és kövesd nyomon a haladásukat.</p>
        </header>

        {/* Statisztikák */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Összes Tanuló</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl text-green-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Aktív Kurzusok</p>
              <p className="text-2xl font-bold">{availableDynamicCourses.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Végzettek</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.courses.some(c => c.progress === 100)).length}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setActiveTab('users'); setFilterPending(true); }}
            className={`p-6 rounded-2xl shadow-sm border flex items-center gap-4 transition-all text-left ${filterPending ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500' : 'bg-white border-gray-100 hover:border-amber-200 hover:shadow-md'}`}
          >
            <div className={`p-4 rounded-xl ${filterPending ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Értékelendő házik</p>
              <p className="text-2xl font-bold text-amber-600">{pendingHomeworks.length}</p>
            </div>
          </button>
        </div>

        {/* Tabok */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => { setActiveTab('users'); setSelectedCourse(null); }}
            className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'users' ? 'text-primary' : 'text-text-muted hover:text-text-dark'}`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tanulók
            </div>
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}
            className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'courses' ? 'text-primary' : 'text-text-muted hover:text-text-dark'}`}
          >
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Kurzusok & Órák
            </div>
            {activeTab === 'courses' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
          </button>
        </div>

        {activeTab === 'users' ? (
          <div>
            {selectedUser ? (
              <AdminStudentDetails 
                user={selectedUser} 
                availableCourses={availableDynamicCourses} 
                onBack={() => setSelectedUser(null)} 
                onUpdate={fetchData}
              />
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Tanulók Kezelése</h2>
                    {filterPending && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Csak értékelendő házik
                      </span>
                    )}
                  </div>
                  <div className="flex w-full md:w-auto gap-3">
                    {filterPending && (
                      <button 
                        onClick={() => setFilterPending(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors text-sm"
                      >
                        Szűrés törlése
                      </button>
                    )}
                    <div className="relative w-full md:w-64">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Keresés név vagy email alapján..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors">
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Szűrés</span>
                    </button>
                  </div>
                </div>

                {/* Tanulók Táblázata */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="pb-3 font-medium px-4">Tanuló</th>
                        <th className="pb-3 font-medium px-4">Csatlakozott</th>
                        {availableDynamicCourses.map(course => (
                          <th key={course.id} className="pb-3 font-medium px-4">{course.title}</th>
                        ))}
                        <th className="pb-3 font-medium px-4 text-right">Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        // Format date safely
                        let joinDateStr = '-';
                        if (user.createdAt) {
                          try {
                            // Handle both Firestore Timestamp and JS Date objects
                            const dateObj = (user.createdAt as any).toDate ? (user.createdAt as any).toDate() : new Date(user.createdAt as any);
                            joinDateStr = dateObj.toLocaleDateString('hu-HU');
                          } catch (e) {
                            console.error("Date parsing error", e);
                          }
                        }

                        return (
                          <tr 
                            key={user.uid} 
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                            onClick={() => setSelectedUser(user)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{user.displayName || 'Névtelen felhasználó'}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {joinDateStr}
                            </td>
                            {availableDynamicCourses.map(course => {
                              const courseData = getCourseData(user, course.id!);
                              return (
                                <td key={course.id} className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCourseAccess(user.uid, course.id!, courseData.hasAccess);
                                      }}
                                      className={`p-1 rounded-full transition-colors ${courseData.hasAccess ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                      title={courseData.hasAccess ? "Hozzáférés megvonása" : "Hozzáférés megadása"}
                                    >
                                      {courseData.hasAccess ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </button>
                                    <div className="w-24">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className={!courseData.hasAccess ? 'text-gray-400' : ''}>Haladás</span>
                                        <span className={`font-medium ${!courseData.hasAccess ? 'text-gray-400' : ''}`}>{courseData.progress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${courseData.progress === 100 ? 'bg-green-500' : !courseData.hasAccess ? 'bg-gray-300' : 'bg-primary'}`} 
                                          style={{ width: `${courseData.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                                  title="Részletek"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUser(user);
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button 
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Törlés"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserToDelete(user);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                      Nincs találat a keresési feltételeknek.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {selectedCourse ? (
              <AdminLessons 
                course={selectedCourse} 
                onBack={() => setSelectedCourse(null)} 
              />
            ) : (
              <AdminCourses onSelectCourse={setSelectedCourse} />
            )}
          </div>
        )}
      </div>

      {/* Törlés Megerősítése Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Tanuló törlése?</h3>
            <p className="text-text-muted text-center mb-8">
              Biztosan törölni szeretnéd <span className="font-bold text-text-dark">{userToDelete.displayName || userToDelete.email}</span> profilját? Ez a művelet nem vonható vissza, és minden kurzushozzáférése megszűnik.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Mégse
              </button>
              <button 
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Clock className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
