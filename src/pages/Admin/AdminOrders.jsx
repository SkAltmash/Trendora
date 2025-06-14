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
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

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
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filters
  const filteredOrders = orders.filter((order) => {
    const matchStatus =
      statusFilter === 'All' || order.status === statusFilter.toLowerCase();
    const matchPayment =
      paymentFilter === 'All' || order.paymentMethod === paymentFilter.toLowerCase();
    return matchStatus && matchPayment;
  });

  // Security
  if (loading) return <div className="text-center mt-20">Loading user data...</div>;
  if (!currentUser || currentUser.role !== 'Admin') {
    console.warn('Unauthorized access attempt:', currentUser?.email);
    return <Navigate to="/" />;
  }

  if (fetching) return <div className="text-center mt-20">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Admin Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded shadow-sm  top-20 z-10">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm"
        >
          {['All', 'Pending', 'Delivered', 'Cancelled'].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm"
        >
          {['All', 'COD', 'Prepaid'].map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders match your filters.</p>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5"
            >
              <div className="mb-2 text-sm text-gray-600 space-y-1">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>User Email:</strong> {order.email}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`inline-block px-2 py-1 rounded text-white text-xs ${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'cancelled' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </p>
              </div>

              {/* Status Actions */}
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
                <h4 className="text-sm font-semibold mb-1">Items Ordered:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {order.cart.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <img
                        src={item.id >= 31 ? item.mainImage : `/${item.mainImage}`}
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
