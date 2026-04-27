import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, Bell, Check, Lock, Video, Download, PlayCircle, MoreVertical, CloudUpload, ChevronRight, Play, ExternalLink, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import DashboardLayout from '../components/DashboardLayout';
import { getCourseById, getLessonsByCourseId, DynamicCourse, DynamicLesson, getUserCourses, getUserHomeworks, Homework, isLessonLocked, UserCourse } from '../lib/db';

export default function Course() {
  const { id, lessonId } = useParams<{ id: string; lessonId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<DynamicCourse | null>(null);
  const [lessons, setLessons] = useState<DynamicLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<DynamicLesson | null>(null);
  const [userHomework, setUserHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [googleTokens, setGoogleTokens] = useState<any>(null);
  const [lockStatus, setLockStatus] = useState<{ locked: boolean; reason?: 'time' | 'homework'; availableAt?: Date }>({ locked: false });
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [allHomeworks, setAllHomeworks] = useState<Homework[]>([]);
  const [nextLessonLocked, setNextLessonLocked] = useState<{ locked: boolean; reason?: 'time' | 'homework' }>({ locked: false });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [courseData, lessonsData, userCourses, homeworksData] = await Promise.all([
          getCourseById(id),
          getLessonsByCourseId(id),
          getUserCourses(user.uid),
          getUserHomeworks(user.uid, id)
        ]);

        if (!courseData) {
          navigate('/dashboard');
          return;
        }

        const uc = userCourses.find(uc => uc.courseId === id && uc.hasAccess);
        setHasAccess(!!uc);
        setUserCourse(uc || null);
        setAllHomeworks(homeworksData);
        setCourse(courseData);
        setLessons(lessonsData);
        
        if (lessonsData.length > 0 && uc) {
          let activeLesson = lessonsData[0];
          let activeIndex = 0;
          if (lessonId) {
            activeIndex = lessonsData.findIndex(l => l.id === lessonId);
            if (activeIndex === -1) activeIndex = 0;
            activeLesson = lessonsData[activeIndex];
          }
          
          const status = isLessonLocked(activeLesson, lessonsData, uc, homeworksData);
          setLockStatus(status);
          setCurrentLesson(activeLesson);

          const lessonHomework = homeworksData.find(h => h.lessonId === activeLesson.id);
          setUserHomework(lessonHomework || null);

          // Check if next lesson is locked
          if (activeIndex < lessonsData.length - 1) {
            const nextL = lessonsData[activeIndex + 1];
            const nextStatus = isLessonLocked(nextL, lessonsData, uc, homeworksData);
            setNextLessonLocked(nextStatus);
          } else {
            setNextLessonLocked({ locked: false });
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, lessonId, user, navigate]);

  useEffect(() => {
    // Load tokens from localStorage if available
    const savedTokens = localStorage.getItem('google_drive_tokens');
    if (savedTokens) {
      setGoogleTokens(JSON.parse(savedTokens));
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const tokens = event.data.tokens;
        setGoogleTokens(tokens);
        localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectGoogleDrive = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_auth_popup', 'width=600,height=700');
    } catch (error) {
      console.error("Error getting auth URL:", error);
      alert("Hiba történt a Google Drive csatlakozás indításakor.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !currentLesson) return;

    if (!googleTokens) {
      alert("Kérlek először csatlakoztasd a Google Drive-odat!");
      return;
    }

    const normalizeText = (text: string) => {
      return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '_')      // Replace non-alphanumeric with underscore
        .replace(/__+/g, '_')            // Replace multiple underscores
        .replace(/^_|_$/g, '');          // Trim underscores
    };

    const username = normalizeText(user.displayName || user.email?.split('@')[0] || 'tanulo');
    const courseName = normalizeText(course?.title || id || 'kurzus');
    const lessonName = normalizeText(currentLesson.title || 'hazi');
    const fileExtension = file.name.split('.').pop();
    
    // Pattern: felhasznalo_kepzes_ora
    const finalFileName = `${username}_${courseName}_${lessonName}.${fileExtension}`;

    try {
      setUploading(true);
      
      // 1. Ensure the "MacskaKommunikáció" folder exists
      let folderId = localStorage.getItem('google_drive_folder_id');
      
      const folderName = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_NAME || 'MacskaKommunikáció Akadémia';
      
      if (!folderId) {
        // Search for the folder first (in case it was created but lost from localStorage)
        const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
          headers: { 'Authorization': `Bearer ${googleTokens.access_token}` }
        });
        const searchData = await searchResponse.json();
        
        if (searchData.files && searchData.files.length > 0) {
          folderId = searchData.files[0].id;
        } else {
          // Create the folder
          const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
          };
          const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${googleTokens.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(folderMetadata)
          });
          const folderData = await folderResponse.json();
          folderId = folderData.id;
        }
        if (folderId) localStorage.setItem('google_drive_folder_id', folderId);
      }

      // 2. Upload the file to the specific folder
      const metadata = {
        name: finalFileName,
        mimeType: file.type,
        parents: folderId ? [folderId] : []
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleTokens.access_token}`,
        },
        body: form,
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("A Google Drive munkamenet lejárt. Kérlek csatlakozz újra!");
          setGoogleTokens(null);
          localStorage.removeItem('google_drive_tokens');
          return;
        }
        throw new Error("Google Drive upload failed");
      }

      const driveData = await response.json();
      const driveFileUrl = driveData.webViewLink;

      // 3. Save the link to Firestore
      if (db) {
        const homeworkData: any = {
          userId: user.uid,
          userEmail: user.email || '',
          fileName: finalFileName,
          fileUrl: driveFileUrl,
          driveFileId: driveData.id,
          courseId: id || "unknown_course",
          lessonId: currentLesson.id!,
          submittedAt: new Date(), // Using JS Date for immediate local update
          status: "pending",
          storageType: "google_drive"
        };

        if (userHomework?.id) {
          // Update existing homework
          const homeworkRef = doc(db, "homeworks", userHomework.id);
          await updateDoc(homeworkRef, {
            ...homeworkData,
            submittedAt: serverTimestamp()
          });
          setUserHomework({ ...homeworkData, id: userHomework.id });
        } else {
          // Create new homework
          const docRef = await addDoc(collection(db, "homeworks"), {
            ...homeworkData,
            submittedAt: serverTimestamp()
          });
          setUserHomework({ ...homeworkData, id: docRef.id });
        }
      }

      alert(userHomework?.id 
        ? `Sikeresen frissítve a házi feladat!\nFájlnév: ${finalFileName}`
        : `Sikeresen feltöltve a Drive-ra a "${folderName}" mappába!\nFájlnév: ${finalFileName}`
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert("Hiba történt a feltöltés során.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Nincs hozzáférésed</h1>
            <p className="text-text-muted mb-8 text-lg">
              Sajnáljuk, de ehhez a kurzushoz jelenleg nincs aktív hozzáférésed. Kérjük vásárold meg a kurzust a folytatáshoz.
            </p>
            <Link 
              to="/courses" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-text-dark font-bold rounded-full hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              Kurzusok böngészése
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 h-full overflow-hidden">
        <aside className="hidden lg:flex w-80 flex-col bg-white border-r border-gray-200 h-[calc(100vh-80px)] sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Jelenlegi kurzus</h2>
            <h1 className="text-xl font-bold text-text-dark leading-tight">{course?.title}</h1>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-text-muted mt-2 text-right">0% Teljesítve</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="px-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tananyag</h3>
              <ul className="space-y-1">
                {lessons.map((lesson, index) => {
                  const isLocked = userCourse ? isLessonLocked(lesson, lessons, userCourse, allHomeworks).locked : false;
                  
                  return (
                    <li key={lesson.id}>
                      <button 
                        onClick={() => !isLocked && navigate(`/course/${id}/${lesson.id}`)}
                        disabled={isLocked}
                        className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          currentLesson?.id === lesson.id 
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                            : isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-text-dark hover:bg-gray-100'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                          currentLesson?.id === lesson.id ? 'border-2 border-primary' : isLocked ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isLocked ? (
                            <Lock className="w-3 h-3" />
                          ) : currentLesson?.id === lesson.id ? (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          ) : (
                            <span className="text-[10px] font-bold">{index + 1}</span>
                          )}
                        </span>
                        <span className="flex-1 text-left line-clamp-1">{lesson.title}</span>
                        {!isLocked && <PlayCircle className={`w-4 h-4 ${currentLesson?.id === lesson.id ? 'text-primary' : 'text-gray-300'}`} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="lg:hidden flex items-center text-sm text-text-muted mb-4">
              <Link to="/dashboard" className="flex items-center hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Vissza
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-text-dark font-medium truncate">{currentLesson?.title}</span>
            </div>

            {currentLesson ? (
              <>
                <section>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-text-dark">{currentLesson.title}</h2>
                      <p className="text-text-muted mt-1">{currentLesson.description}</p>
                    </div>
                  </div>

                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
                    {lockStatus.locked ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-8 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Ez az óra még zárva van</h3>
                        <p className="text-gray-400 max-w-md">
                          {lockStatus.reason === 'time' ? (
                            <>
                              Ez a lecke {lockStatus.availableAt?.toLocaleDateString('hu-HU')} {lockStatus.availableAt?.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })} után válik elérhetővé.
                            </>
                          ) : (
                            <>
                              Kérjük töltsd fel az előző órák házi feladatát a folytatáshoz! Ez az óra csak akkor válik elérhetővé, ha minden korábbi kötelező feladatot beküldtél.
                            </>
                          )}
                        </p>
                      </div>
                    ) : currentLesson.videoUrl ? (
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${currentLesson.videoUrl.split('v=')[1]?.split('&')[0] || currentLesson.videoUrl.split('/').pop()}?rel=0`} 
                        title={currentLesson.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>Nincs videó elérhető ehhez az órához.</p>
                      </div>
                    )}
                  </div>

                  {/* Next Lesson Status for Unlocked Lessons */}
                  {!lockStatus.locked && nextLessonLocked.locked && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-dark">Következő óra állapota</p>
                          <p className="text-xs text-text-muted">
                            {nextLessonLocked.reason === 'homework' 
                              ? 'Zárva: Töltsd fel a házi feladatot a feloldáshoz!' 
                              : 'Zárva: Még nem telt el a szükséges idő a következő óráig.'}
                          </p>
                        </div>
                      </div>
                      <Link 
                        to={`/course/${id}`}
                        className="text-xs font-bold text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('homework-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Részletek
                      </Link>
                    </div>
                  )}
                </section>

                {currentLesson.homeworkRequired && (
                  <section id="homework-section" className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <PawPrint className="text-primary w-6 h-6" />
                        <h3 className="text-lg font-bold text-text-dark">Házi feladat</h3>
                      </div>
                      <p className="text-sm text-text-muted mb-4">
                        {currentLesson.homeworkDescription || 'Ehhez az órához házi feladat szükséges. Kérjük töltsd fel a megoldást (videó, kép vagy dokumentum).'}
                      </p>

                      {/* Next Lesson Status Warning */}
                      {!userHomework && currentLesson.homeworkRequired && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-pulse">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-800">Figyelem!</p>
                            <p className="text-[11px] text-amber-700 leading-tight">
                              A következő óra csak akkor válik elérhetővé, ha feltöltöd a házi feladatot.
                            </p>
                          </div>
                        </div>
                      )}

                      {nextLessonLocked.locked && nextLessonLocked.reason === 'homework' && userHomework && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-blue-800">Következő óra állapota</p>
                            <p className="text-[11px] text-blue-700 leading-tight">
                              Feltöltötted a házit, de a következő óra még zárva maradhat, ha korábbi órák házija hiányzik.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {userHomework && (
                        <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-bold text-text-dark">Admin Értékelés</h4>
                          </div>
                          {userHomework.feedback ? (
                            <>
                              <p className="text-sm text-text-dark italic">"{userHomework.feedback}"</p>
                              <div className="mt-2 flex items-center gap-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${userHomework.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {userHomework.status === 'approved' ? 'Elfogadva' : 'Javítás szükséges'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-text-muted italic">Még nem érkezett értékelés.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      {!googleTokens ? (
                        <div className="h-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4">
                            <ExternalLink className="w-8 h-8 text-primary" />
                          </div>
                          <h4 className="text-lg font-bold text-text-dark mb-2">Google Drive Csatlakoztatása</h4>
                          <p className="text-sm text-text-muted mb-6 max-w-xs">
                            A házi feladat feltöltéséhez kérlek csatlakoztasd a Google Drive fiókodat.
                          </p>
                          <button 
                            onClick={connectGoogleDrive}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-text-dark font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                          >
                            Csatlakozás Google Drive-hoz
                          </button>
                        </div>
                      ) : (
                        <label className={`h-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col items-center justify-center p-8 relative overflow-hidden ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="video/*,image/*,application/pdf" 
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                          <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <CloudUpload className="w-8 h-8 text-primary" />
                          </div>
                          <h4 className="text-lg font-bold text-text-dark mb-1">
                            {uploading ? 'Feltöltés a Drive-ra...' : userHomework ? 'Házi feladat frissítése' : 'Házi feladat feltöltése'}
                          </h4>
                          {userHomework && !uploading && (
                            <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2 animate-pulse">
                              <Bell className="w-3 h-3" />
                              Figyelem: Már töltöttél fel feladatot. Az új feltöltés felülírja az előzőt!
                            </div>
                          )}
                          <p className="text-sm text-text-muted mb-4 text-center max-w-xs">
                            {userHomework ? 'Válassz új fájlt a korábbi lecseréléséhez.' : 'Feltöltés közvetlenül a Google Drive-odra.'}
                          </p>
                          <div className="flex flex-col items-center gap-2">
                            <div className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-text-dark font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                              Fájl kiválasztása
                            </div>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setGoogleTokens(null);
                                localStorage.removeItem('google_drive_tokens');
                              }}
                              className="text-xs text-red-500 hover:underline mt-2"
                            >
                              Google Drive leválasztása
                            </button>
                          </div>
                        </label>
                      )}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-text-muted">
                Ehhez a kurzushoz még nem töltöttek fel órákat.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
