import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
import { Navigate } from 'react-router-dom';

const AdminProducts = () => {
  const { currentUser, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);

  // ✅ Fetch all products from Firestore
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('id'));
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map((docSnap) => ({
        firebaseId: docSnap.id,
        ...docSnap.data(),
      }));
      setProducts(productList);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && currentUser?.role === 'Admin') {
      fetchProducts();
    }
  }, [loading, currentUser]);

  // ✅ Update quantity in Firestore
  const updateQuantity = async (firebaseId, newQty) => {
    try {
      await updateDoc(doc(db, 'products', firebaseId), {
        quantity: newQty,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.firebaseId === firebaseId ? { ...p, quantity: newQty } : p
        )
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  // ✅ Toggle stock status (quantity 0 ⇄ 10)
  const toggleStock = async (firebaseId, currentQty) => {
    const newQty = currentQty > 0 ? 0 : 10;
    await updateQuantity(firebaseId, newQty);
  };

  // 🔐 Admin Access Protection
  if (loading) return <div className="text-center mt-20 h-screen w-screen flex justify-center text-2xl">Loading user data...</div>;
  if (!currentUser || currentUser.role !== 'Admin') {
    console.warn('Unauthorized access attempt:', currentUser?.email);
    return <Navigate to="/" />;
  }

  if (fetching) return <div className="text-center mt-20 w-screen h-screen flex justify-center text-2xl">Loading products...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
<div className="flex items-center justify-between mb-6">
  <h2 className="text-3xl font-bold text-indigo-700">Manage Products</h2>
  <Link
    to="/admin/add"
    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium shadow"
  >
    Add Product
  </Link>
</div>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.firebaseId}
              className="border p-4 rounded shadow-sm bg-white"
            >
              {/* 🖼 Product Info */}
              <div className="flex items-center gap-4 mb-4">
               <img
  src={product.id >= 31 ? product.mainImage?.trim() : `/${product.mainImage?.trim()}`}
  alt={product.title}
  className="w-20 h-20 object-cover rounded border"
/>

                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {product.gender} • {product.category}
                  </p>
                  <p className="text-sm text-gray-800">₹{product.price}</p>
                </div>
              </div>

              {/* 🔢 Quantity Input */}
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

              {/* 🔄 Toggle Stock */}
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
