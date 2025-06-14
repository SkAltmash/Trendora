import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const AdminProducts = () => {
  const { currentUser, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [genderFilter, setGenderFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (!loading && currentUser?.role === 'Admin') {
      fetchProducts();
    }
  }, [loading, currentUser]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('id'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => ({
        firebaseId: docSnap.id,
        ...docSnap.data(),
      }));
      setProducts(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setFetching(false);
    }
  };

  const updateQuantity = async (firebaseId, newQty) => {
    try {
      await updateDoc(doc(db, 'products', firebaseId), { quantity: newQty });
      setProducts((prev) =>
        prev.map((p) => (p.firebaseId === firebaseId ? { ...p, quantity: newQty } : p))
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const toggleStock = async (firebaseId, currentQty) => {
    const newQty = currentQty > 0 ? 0 : 10;
    await updateQuantity(firebaseId, newQty);
  };

  const applyFilters = () => {
    let result = [...products];
    if (genderFilter !== 'All') result = result.filter(p => p.gender === genderFilter);
    if (categoryFilter !== 'All') result = result.filter(p => p.category === categoryFilter);
    setFiltered(result);
  };

  useEffect(() => {
    applyFilters();
  }, [genderFilter, categoryFilter, products]);

  if (loading) return <div className="text-center mt-20 text-xl">Loading user data...</div>;
  if (!currentUser || currentUser.role !== 'Admin') return <Navigate to="/" />;
  if (fetching) return <div className="text-center mt-20 text-xl">Loading products...</div>;

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const genders = ['All', ...new Set(products.map(p => p.gender))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">Manage Products</h2>
        <Link
          to="/admin/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium shadow"
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-4 py-2 border rounded text-sm"
        >
          {genders.map((g, i) => (
            <option key={i} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded text-sm"
        >
          {categories.map((c, i) => (
            <option key={i} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setGenderFilter('All');
            setCategoryFilter('All');
          }}
          className="px-4 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>

      {/* Products */}
      {filtered.length === 0 ? (
        <p className="text-gray-600">No products found for selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((product) => (
            <div
              key={product.firebaseId}
              className="border rounded-lg shadow-sm bg-white p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={product.id >= 31 ? product.mainImage?.trim() : `/${product.mainImage?.trim()}`}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div>
                  <p className="font-semibold truncate w-52">{product.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{product.gender} • {product.category}</p>
                  <p className="text-sm text-gray-800">₹{product.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Quantity:</label>
                <input
                  type="number"
                  min="0"
                  value={product.quantity}
                  onChange={(e) =>
                    updateQuantity(product.firebaseId, parseInt(e.target.value))
                  }
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>

              <button
                onClick={() => toggleStock(product.firebaseId, product.quantity)}
                className={`px-4 py-1 rounded text-white text-sm ${
                  product.quantity === 0
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {product.quantity === 0 ? 'Mark In Stock' : 'Mark Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
