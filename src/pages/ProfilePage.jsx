import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCreditCard,
  faMapMarkerAlt,
  faBoxOpen,
  faClipboardList,
  faMoneyBillWave,
  faIdBadge,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const confirmCancel = (orderId) => setCancelTarget(orderId);

  const handleCancel = async () => {
    try {
      await updateDoc(doc(db, 'orders', cancelTarget), {
        status: 'cancelled',
      });
      const updated = orders.map((order) =>
        order.id === cancelTarget ? { ...order, status: 'cancelled' } : order
      );
      setOrders(updated);
      applyFilter(updated);
      toast.success('Order cancelled successfully.');
    } catch (error) {
      console.error('Cancel failed:', error);
      toast.error('Failed to cancel the order.');
    } finally {
      setCancelTarget(null);
    }
  };

  const applyFilter = (ordersToFilter = orders) => {
    if (filter === 'delivered') {
      setFilteredOrders(ordersToFilter.filter((o) => o.status === 'delivered'));
    } else {
      setFilteredOrders(ordersToFilter);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [filter]);

  if (!currentUser) {
    return (
      <div className="text-center mt-20 text-lg">
        Please{' '}
        <Link to="/login" className="text-indigo-600 underline">
          log in
        </Link>{' '}
        to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 mt-20">
      <h2 className="text-3xl font-bold mb-4 text-indigo-700">Your Profile</h2>

      {/* User Info */}
      <div className="mb-8 bg-gray-100 p-4 rounded shadow-sm text-center">
        <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full shadow-md">
          <img
            src={currentUser.avatar || '/default-avatar.png'}
            alt="User"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <p className="text-lg font-semibold">{currentUser.name || 'User'}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>User ID:</strong> {currentUser.uid}</p>
      </div>

      {/* Filter */}
      <div className="mb-6 text-right">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 text-sm border rounded shadow-sm focus:outline-none"
        >
          <option value="all">All Orders</option>
          <option value="delivered">Delivered Only</option>
        </select>
      </div>

      {/* Orders */}
      <h3 className="text-2xl font-semibold mb-4">Order History</h3>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 mb-4">
                <p><FontAwesomeIcon icon={faIdBadge} className="mr-2 text-indigo-500" /><strong>Order ID:</strong> {order.id}</p>
                <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500" /><strong>Date:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
                <p><FontAwesomeIcon icon={faCreditCard} className="mr-2 text-indigo-500" /><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                <p>
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-2 text-indigo-500" />
                  <strong>Status:</strong>{' '}
                  <span className={`inline-block px-2 py-1 rounded text-white ${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-600'
                  }`}>
                    {order.status}
                  </span>

                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => confirmCancel(order.id)}
                        className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Cancel Order
                      </button>

                 
                    </>
                  )}
                </p>
                <p><FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-indigo-500" /><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-indigo-500" /><strong>Address:</strong> {order.address}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-md font-semibold mb-2 text-gray-800">
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-indigo-500" /> Items:
                </h4>
                <div className="divide-y divide-gray-100">
                  {order.cart.map((item, index) => (
                    <div key={index} className="flex items-center py-3 gap-4">
                      <img
                        src={item.id >= 31 ? item.mainImage : `/${item.mainImage}`}
                        alt={item.title}
                        className="w-14 h-14 rounded object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md text-center max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cancel Order</h2>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to cancel this order?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
