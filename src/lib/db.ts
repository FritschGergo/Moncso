import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp, 
  addDoc,
  Timestamp,
  getDocFromCache,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';

// --- Error Handling ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // We don't necessarily want to throw here as 'test/connection' might just not exist
  }
}

// --- Types ---

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  createdAt: Timestamp | Date;
}

export interface UserCourse {
  id?: string;
  userId: string;
  courseId: string;
  hasAccess: boolean;
  progress: number;
  enrolledAt: Timestamp | Date;
  lastAccessedAt?: Timestamp | Date;
}

export interface Homework {
  id?: string;
  userId: string;
  courseId: string;
  lessonId: string;
  fileUrl: string;
  fileName: string;
  submittedAt: Timestamp | Date;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface DynamicCourse {
  id?: string;
  title: string;
  description: string;
  price: string;
  promoVideoUrl: string;
  popular: boolean;
  features: string[];
  lessonCount: number;
  createdAt?: Timestamp | Date;
}

export interface DynamicLesson {
  id?: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  videoUrl: string;
  homeworkRequired: boolean;
  homeworkDescription?: string;
  createdAt?: Timestamp | Date;
}

// --- User Functions ---

export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...data,
      createdAt: serverTimestamp(),
      role: data.role || 'student'
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null; // unreachable due to throw in handleFirestoreError
  }
};

export const getAllUsersWithCourses = async (): Promise<(UserProfile & { courses: UserCourse[] })[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = 'users';
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    
    const users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    
    const usersWithCourses = await Promise.all(users.map(async (user) => {
      const subPath = `users/${user.uid}/courses`;
      try {
        const coursesRef = collection(db, subPath);
        const coursesSnap = await getDocs(coursesRef);
        const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserCourse));
        return { ...user, courses };
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, subPath);
        return { ...user, courses: [] };
      }
    }));
    
    return usersWithCourses;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// --- User Course Functions ---

export const enrollUserInCourse = async (userId: string, courseId: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = `users/${userId}/courses/${courseId}`;
  try {
    const userCourseRef = doc(db, `users/${userId}/courses`, courseId);
    await setDoc(userCourseRef, {
      userId,
      courseId,
      hasAccess: true,
      progress: 0,
      enrolledAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserCourseProgress = async (userId: string, courseId: string, progress: number) => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = `users/${userId}/courses/${courseId}`;
  try {
    const userCourseRef = doc(db, `users/${userId}/courses`, courseId);
    await updateDoc(userCourseRef, {
      progress,
      lastAccessedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const toggleUserCourseAccess = async (userId: string, courseId: string, hasAccess: boolean) => {
  if (!db) throw new Error("Firestore is not initialized");
  const userCourseRef = doc(db, `users/${userId}/courses`, courseId);
  
  // Check if it exists first
  const snap = await getDoc(userCourseRef);
  if (snap.exists()) {
    await updateDoc(userCourseRef, { hasAccess });
  } else {
    // If not exists, create it with the specified access
    await setDoc(userCourseRef, {
      userId,
      courseId,
      hasAccess,
      progress: 0,
      enrolledAt: serverTimestamp()
    });
  }
};

export const getUserCourses = async (userId: string): Promise<UserCourse[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = `users/${userId}/courses`;
  try {
    const coursesRef = collection(db, path);
    const snap = await getDocs(coursesRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserCourse));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// --- Homework Functions ---

export const submitHomework = async (data: Omit<Homework, 'id' | 'submittedAt' | 'status'>) => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = 'homeworks';
  try {
    const homeworkRef = collection(db, 'homeworks');
    const docRef = await addDoc(homeworkRef, {
      ...data,
      status: 'pending',
      submittedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return "";
  }
};

export const getUserHomeworks = async (userId: string, courseId?: string): Promise<Homework[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const homeworkRef = collection(db, 'homeworks');
  let q = query(homeworkRef, where('userId', '==', userId));
  
  if (courseId) {
    q = query(homeworkRef, where('userId', '==', userId), where('courseId', '==', courseId));
  }
  
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework));
};

export const getAllPendingHomeworks = async (): Promise<Homework[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const homeworkRef = collection(db, 'homeworks');
  const q = query(homeworkRef, where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Homework));
};

export const updateHomeworkStatus = async (homeworkId: string, status: 'approved' | 'rejected', feedback?: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  const homeworkRef = doc(db, 'homeworks', homeworkId);
  const updateData: any = { status };
  if (feedback) updateData.feedback = feedback;
  
  await updateDoc(homeworkRef, updateData);
};

// --- Dynamic Content Functions ---

export const getCourses = async (): Promise<DynamicCourse[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const path = 'courses';
  try {
    const coursesRef = collection(db, path);
    const snap = await getDocs(coursesRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DynamicCourse));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getCourseById = async (courseId: string): Promise<DynamicCourse | null> => {
  if (!db) throw new Error("Firestore is not initialized");
  const courseRef = doc(db, 'courses', courseId);
  const snap = await getDoc(courseRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as DynamicCourse;
  }
  return null;
};

export const saveCourse = async (course: Partial<DynamicCourse>) => {
  if (!db) throw new Error("Firestore is not initialized");
  const coursesRef = collection(db, 'courses');
  if (course.id) {
    const courseRef = doc(db, 'courses', course.id);
    const { id, ...data } = course;
    await updateDoc(courseRef, data);
    return id;
  } else {
    const docRef = await addDoc(coursesRef, {
      ...course,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
};

export const deleteCourse = async (courseId: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  // Also delete lessons
  const lessons = await getLessonsByCourseId(courseId);
  await Promise.all(lessons.map(l => deleteLesson(l.id!)));
  
  const courseRef = doc(db, 'courses', courseId);
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(courseRef);
};

export const getLessonsByCourseId = async (courseId: string): Promise<DynamicLesson[]> => {
  if (!db) throw new Error("Firestore is not initialized");
  const lessonsRef = collection(db, 'lessons');
  const q = query(lessonsRef, where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as DynamicLesson))
    .sort((a, b) => a.order - b.order);
};

export const saveLesson = async (lesson: Partial<DynamicLesson>) => {
  if (!db) throw new Error("Firestore is not initialized");
  const lessonsRef = collection(db, 'lessons');
  if (lesson.id) {
    const lessonRef = doc(db, 'lessons', lesson.id);
    const { id, ...data } = lesson;
    await updateDoc(lessonRef, data);
    return id;
  } else {
    const docRef = await addDoc(lessonsRef, {
      ...lesson,
      createdAt: serverTimestamp()
    });
    
    // Update course lesson count
    if (lesson.courseId) {
      const course = await getCourseById(lesson.courseId);
      if (course) {
        await saveCourse({ id: course.id, lessonCount: (course.lessonCount || 0) + 1 });
      }
    }
    
    return docRef.id;
  }
};

export const deleteLesson = async (lessonId: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  const lessonRef = doc(db, 'lessons', lessonId);
  const snap = await getDoc(lessonRef);
  if (snap.exists()) {
    const lesson = snap.data() as DynamicLesson;
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(lessonRef);
    
    // Update course lesson count
    if (lesson.courseId) {
      const course = await getCourseById(lesson.courseId);
      if (course) {
        await saveCourse({ id: course.id, lessonCount: Math.max(0, (course.lessonCount || 0) - 1) });
      }
    }
  }
};

export const deleteUserProfile = async (uid: string) => {
  if (!db) throw new Error("Firestore is not initialized");
  
  // 1. Delete user courses subcollection
  const coursesRef = collection(db, `users/${uid}/courses`);
  const coursesSnap = await getDocs(coursesRef);
  const { deleteDoc } = await import('firebase/firestore');
  
  await Promise.all(coursesSnap.docs.map(d => deleteDoc(doc(db, `users/${uid}/courses`, d.id))));
  
  // 2. Delete user profile
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
};

export const updateUserCourseEnrollmentDate = async (userId: string, courseId: string, enrolledAt: Date) => {
  if (!db) throw new Error("Firestore is not initialized");
  const userCourseRef = doc(db, `users/${userId}/courses`, courseId);
  await updateDoc(userCourseRef, {
    enrolledAt: Timestamp.fromDate(enrolledAt)
  });
};

export const isLessonLocked = (
  lesson: DynamicLesson,
  allLessons: DynamicLesson[],
  userCourse: UserCourse,
  homeworks: Homework[]
): { locked: boolean; reason?: 'time' | 'homework'; availableAt?: Date } => {
  if (lesson.order === 1) return { locked: false };

  // 1. Time check: Each lesson becomes available 1 week after the previous one, starting from enrollment
  const enrolledAtRaw = userCourse.enrolledAt;
  const enrolledAt = (enrolledAtRaw as any).toDate ? (enrolledAtRaw as any).toDate() : new Date(enrolledAtRaw as any);
  
  const weeksToAdd = lesson.order - 1;
  const availableAt = new Date(enrolledAt);
  availableAt.setDate(availableAt.getDate() + (weeksToAdd * 7));
  availableAt.setHours(6, 0, 0, 0);

  const now = new Date();
  if (now < availableAt) {
    return { locked: true, reason: 'time', availableAt };
  }

  // 2. Homework check: Previous lessons with required homework must have a submission
  const previousLessons = allLessons.filter(l => l.order < lesson.order);
  for (const prev of previousLessons) {
    if (prev.homeworkRequired) {
      const hasUploaded = homeworks.some(h => h.lessonId === prev.id);
      if (!hasUploaded) {
        return { locked: true, reason: 'homework' };
      }
    }
  }

  return { locked: false };
};
