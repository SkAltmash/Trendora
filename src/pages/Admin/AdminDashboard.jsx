import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser, loading } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    recentOrders: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));

        const revenue = ordersSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          return acc + (data.totalAmount || 0);
        }, 0);

        const recentOrders = ordersSnap.docs
          .slice(0, 5)
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setStats({
          users: usersSnap.size,
          products: productsSnap.size,
          orders: ordersSnap.size,
          revenue,
          recentOrders,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (!loading && currentUser?.role === 'Admin') {
      fetchStats();
    }
  }, [loading, currentUser]);

  if (loading) return <div className="text-center mt-20 text-xl">Loading user data...</div>;
  if (!currentUser || currentUser.role !== 'Admin') return <Navigate to="/" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>

      {loadingStats ? (
        <p>Loading stats...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-black">
            <Card title="Users" value={stats.users} color="blue"/>
            <Card title="Products" value={stats.products} color="green" />
            <Card title="Orders" value={stats.orders} color="purple" />
            <Card title="Revenue" value={`₹${stats.revenue}`} color="yellow" />
          </div>
         {/* Quick Links */}
         <Link to="/admin/products">
              <div className="bg-blue-100 p-4 rounded shadow mb-4 hover:bg-blue-200 transition-colors">
                 <h2 className="text-lg font-semibold text-blue-700">Manage Products</h2>
                 <p className="text-sm text-gray-600">Add, edit, or delete products.</p>
              </div>
        </Link>
         
         <Link to="/admin/orders">
                <div className="bg-green-100 p-4 rounded shadow mb-4 hover:bg-green-200 transition-colors">
                    <h2 className="text-lg font-semibold text-green-700">Manage Orders</h2>
                    <p className="text-sm text-gray-600">View and manage all orders.</p>
                </div>
           </Link>

          {/* Recent Orders */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Orders</h2>
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="border p-3 rounded bg-white shadow-sm text-sm">
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className={`p-4 rounded shadow text-black bg-${color}-500`}>
    <p className="text-sm">{title}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </div>
);

export default AdminDashboard;
