import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminUsers = () => {
  const { currentUser, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Fetch all users and orders
  useEffect(() => {
    const fetchUsersAndOrders = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const userList = usersSnap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);

        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orderList = ordersSnap.docs.map(doc => doc.data());
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching users/orders:', error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading && currentUser?.role === 'Admin') {
      fetchUsersAndOrders();
    }
  }, [loading, currentUser]);

  if (loading) return <div className="mt-20 text-center text-xl">Loading user...</div>;
  if (!currentUser || currentUser.role !== 'Admin') return <Navigate to="/" />;
  if (fetching) return <div className="mt-20 text-center text-xl">Loading data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">All Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map(user => {
            const userOrders = orders.filter(order => order.userId === user.uid);

            return (
              <div
                key={user.uid}
                className="border border-gray-200 bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                    alt={user.name}
                    className="w-14 h-14 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold text-lg">{user.name || 'Unnamed'}</p>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Current Orders:</h4>
                  {userOrders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders found</p>
                  ) : (
                    <ul className="text-sm space-y-2">
                      {userOrders.map((order, index) => (
                        <li key={index} className="p-2 bg-gray-50 rounded border">
                          <p><strong>Status:</strong> {order.status}</p>
                          <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                          <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
