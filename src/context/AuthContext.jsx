import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          const userData = docSnap.exists() ? docSnap.data() : {};

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: userData.name || '',
            avatar:
              userData.avatar ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
            role: userData.role || 'User', // fallback to "User"
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          setCurrentUser({ uid: user.uid, email: user.email }); // basic fallback
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // ✅ set loading done
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCred.user.uid), {
      email: userCred.user.email,
      name: '',
      avatar: '',
      role: 'User',
    });
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
