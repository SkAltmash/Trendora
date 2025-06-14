import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import Cart from '../components/Cart';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const { currentUser } = useAuth();
  const { favorites } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      try {
        if (!favorites.length || !currentUser) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const chunks = [];
        for (let i = 0; i < favorites.length; i += 10) {
          chunks.push(favorites.slice(i, i + 10));
        }

        const fetched = [];

        for (const chunk of chunks) {
          const q = query(collection(db, 'products'), where('id', 'in', chunk));
          const snapshot = await getDocs(q);
          fetched.push(...snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
        }

        setProducts(fetched);
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites, currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center mt-20 text-lg">
        Please <Link to="/login" className="text-indigo-600 underline">login</Link> to view your favorite list.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Your Favorite Products</h2>

      {loading ? (
        <p>Loading favorites...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center">You haven't favorited any products yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
          {products.map(product => (
            <Cart key={product.id} item={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
