import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile, UserProfile, createUserProfile } from "../lib/db";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  globalError: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, globalError: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setGlobalError("A Firebase nincs konfigurálva.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          let userProfile = await getUserProfile(firebaseUser.uid);
          
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@admin.com';
          const isAdminEmail = firebaseUser.email === adminEmail;
          
          // If profile is missing, create it
          if (!userProfile) {
            console.log("Creating missing profile for:", firebaseUser.email);
            const newProfileData = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Tanuló',
              role: (isAdminEmail ? 'admin' : 'student') as 'admin' | 'student'
            };
            await createUserProfile(firebaseUser.uid, newProfileData);
            userProfile = await getUserProfile(firebaseUser.uid);
          } 
          // If it's the admin email but role is not admin in DB, fix it
          else if (isAdminEmail && userProfile.role !== 'admin') {
            console.log("Fixing admin role for:", firebaseUser.email);
            await createUserProfile(firebaseUser.uid, { role: 'admin' });
            userProfile = { ...userProfile, role: 'admin' };
          }
          
          setProfile(userProfile);
          setGlobalError(null);
        } catch (error: any) {
          console.error("Error in auth state change:", error);
          setProfile(null);
          // Only show fatal errors globally
          if (error.message?.includes('Missing or insufficient permissions')) {
            setGlobalError("Adatbázis hiba: Nincs jogosultságod az adatok eléréséhez. Ellenőrizd a Firestore szabályokat.");
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, globalError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
