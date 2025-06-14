import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Create context
const FavoriteContext = createContext();

// Export context hook
export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavorites([]);
        return;
      }

      try {
        const ref = doc(db, 'favorites', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setFavorites(snap.data().items || []);
        } else {
          // Initialize with empty list if no doc exists
          await setDoc(ref, { items: [] });
          setFavorites([]);
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      }
    };

    loadFavorites();
  }, [currentUser]);

  const toggleFavorite = async (productId) => {
    if (!currentUser) return;
    try {
      const ref = doc(db, 'favorites', currentUser.uid);
      const isFav = favorites.includes(productId);
      const updated = isFav
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      await setDoc(ref, { items: updated }, { merge: true });
      setFavorites(updated);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
