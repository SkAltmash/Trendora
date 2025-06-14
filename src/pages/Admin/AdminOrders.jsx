// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminOrders = () => {
  const { currentUser, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && currentUser?.role === 'Admin') {
      fetchOrders();
    }
  }, [loading, currentUser]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const allOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // ✅ Secure admin route
  if (loading) return <div className="text-center mt-20">Loading user data...</div>;
  if (!currentUser || currentUser.role !== 'Admin') {
    console.warn('Unauthorized access attempt:', currentUser?.email);
    return <Navigate to="/" />;
  }

  if (fetching) return <div className="text-center mt-20">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">All Orders (Admin)</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5"
            >
              <div className="mb-2 text-sm text-gray-600">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>User Email:</strong> {order.email}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`inline-block px-2 py-1 rounded text-white ${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'cancelled' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    {order.status}
                  </span>
                </p>
              </div>

              {/* Update Status Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {order.status !== 'delivered' && (
                  <button
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Mark as Cancelled
                  </button>
                )}
              </div>

              {/* Ordered Items */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-1">Items:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {order.cart.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <img
                        src={item.id >= 31 ?item.mainImage : `/${item.mainImage}`}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded border"
                      />
                      <div>
                        {item.title} — Qty: {item.quantity}, ₹{item.price} each
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
