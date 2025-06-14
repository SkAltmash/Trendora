// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { currentUser, loading } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    recentOrders: [],
    revenueByMonth: {},
    orderStatusCount: {},
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));

        let revenue = 0;
        const revenueByMonth = {};
        const orderStatusCount = { pending: 0, delivered: 0, cancelled: 0 };

        const recentOrders = [];

        ordersSnap.docs.forEach((doc, index) => {
          const data = doc.data();
          const amount = data.totalAmount || 0;
          revenue += amount;

          const createdAt = data.createdAt?.toDate();
          if (createdAt) {
            const month = createdAt.toLocaleString('default', { month: 'short' });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + amount;
          }

          orderStatusCount[data.status] = (orderStatusCount[data.status] || 0) + 1;

          if (index < 5) {
            recentOrders.push({ id: doc.id, ...data });
          }
        });

        setStats({
          users: usersSnap.size,
          products: productsSnap.size,
          orders: ordersSnap.size,
          revenue,
          recentOrders,
          revenueByMonth,
          orderStatusCount,
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

  // Bar Chart Data (Monthly Revenue)
  const barData = {
    labels: Object.keys(stats.revenueByMonth),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(stats.revenueByMonth),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
  };

  // Pie Chart Data (Order Status)
  const pieData = {
    labels: Object.keys(stats.orderStatusCount),
    datasets: [
      {
        label: 'Orders',
        data: Object.values(stats.orderStatusCount),
        backgroundColor: ['#facc15', '#10b981', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>

      {loadingStats ? (
          <div className='flex w-screen justify-center h-screen'> 
          <img src="/public/assets/img/loading.gif" className='object-cover' alt="" />
         </div>

      ) : (
<>        
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard title="Users" value={stats.users} color="bg-blue-500" />
            <StatCard title="Products" value={stats.products} color="bg-green-500" />
            <StatCard title="Orders" value={stats.orders} color="bg-purple-500" />
            <StatCard title="Revenue" value={`₹${stats.revenue}`} color="bg-yellow-500" />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-4 rounded shadow h-[300px] md:h-[400px] max-w-screen">
              <h2 className="text-lg font-semibold mb-2 text-indigo-700">Monthly Revenue</h2>
              <div className="h-full">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow h-[300px] md:h-[400px] max-w-screen">
              <h2 className="text-lg font-semibold mb-2 text-indigo-700">Order Status</h2>
              <div className="h-full">
                <Doughnut data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <QuickLink to="/admin/products" title="Manage Products" color="blue" />
            <QuickLink to="/admin/orders" title="Manage Orders" color="green" />
            <QuickLink to="/admin/user" title="Manage Users" color="yellow" />
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Orders</h2>
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="border p-4 rounded bg-white shadow-sm text-sm"
                  >
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

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded shadow text-white ${color}`}>
    <p className="text-sm">{title}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </div>
);

const QuickLink = ({ to, title, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    green: 'bg-green-100 hover:bg-green-200 text-green-700',
    yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
  };
  return (
    <Link to={to}>
      <div className={`p-4 rounded shadow transition-colors ${colorMap[color]}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">Click to manage</p>
      </div>
    </Link>
  );
};

export default AdminDashboard;
