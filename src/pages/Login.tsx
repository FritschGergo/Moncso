import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/db';
import { PawPrint } from 'lucide-react';

const getErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Érvénytelen email cím formátum.';
    case 'auth/user-disabled':
      return 'Ez a felhasználói fiók le lett tiltva.';
    case 'auth/user-not-found':
      return 'Nem található felhasználó ezzel az email címmel.';
    case 'auth/wrong-password':
      return 'Helytelen jelszó.';
    case 'auth/email-already-in-use':
      return 'Ez az email cím már regisztrálva van.';
    case 'auth/weak-password':
      return 'A jelszó túl gyenge (legalább 6 karakter szükséges).';
    case 'auth/invalid-credential':
      return 'Helytelen email cím vagy jelszó.';
    case 'auth/too-many-requests':
      return 'Túl sok sikertelen próbálkozás. Kérlek próbáld újra később.';
    case 'auth/operation-not-allowed':
      return 'Az Email/Jelszó bejelentkezés jelenleg le van tiltva a Firebase konzolban. Kérlek vedd fel a kapcsolatot az üzemeltetővel.';
    default:
      return 'Hiba történt a művelet során. Kérlek próbáld újra.';
  }
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    
    if (!auth) {
      setError('A Firebase nincs konfigurálva. Kérlek állítsd be a környezeti változókat a Secrets panelen.');
      return;
    }

    if (!isLogin && !acceptTerms) {
      setError('A regisztrációhoz el kell fogadnod a Felhasználási Feltételeket és az Adatvédelmi Irányelveket.');
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userProfile = await getUserProfile(userCredential.user.uid);
        if (userProfile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await createUserProfile(user.uid, {
          email: user.email || email,
          displayName: email.split('@')[0],
          role: 'student'
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code));
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');
    
    if (!auth) {
      setError('A Firebase nincs konfigurálva.');
      return;
    }

    if (!email) {
      setError('Kérlek add meg az email címedet a jelszó visszaállításához.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('A jelszó visszaállító emailt elküldtük. Kérlek ellenőrizd a postafiókodat.');
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code));
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/">
            <PawPrint className="text-primary w-12 h-12 hover:scale-110 transition-transform" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-dark">
          {isLogin ? 'Jelentkezz be a fiókodba' : 'Hozz létre egy fiókot'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {resetMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                {resetMessage}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-dark">
                Email cím
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-text-dark"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-dark">
                  Jelszó
                </label>
                {isLogin && (
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-primary hover:text-primary-hover"
                    >
                      Elfelejtetted a jelszavad?
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-text-dark"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-dark">
                  Elfogadom a{' '}
                  <Link to="/terms" target="_blank" className="text-primary hover:text-primary-hover hover:underline">
                    Felhasználási Feltételeket
                  </Link>{' '}
                  és az{' '}
                  <Link to="/privacy" target="_blank" className="text-primary hover:text-primary-hover hover:underline">
                    Adatvédelmi Irányelveket
                  </Link>
                  .
                </label>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-text-dark bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-text-muted">
                  Vagy
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setResetMessage('');
                  setAcceptTerms(false);
                }}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                {isLogin ? 'Nincs még fiókod? Regisztrálj' : 'Már van fiókod? Jelentkezz be'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
