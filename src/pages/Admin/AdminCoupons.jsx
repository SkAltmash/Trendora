import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percent', // 'percent' or 'flat'
    discount: '',
    minAmount: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    const snapshot = await getDocs(collection(db, 'coupons'));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCoupons(list);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    const { code, discountType, discount, minAmount } = form;
    if (!code || !discount) return toast.error('All fields are required');
    if (Number(discount) <= 0) return toast.error('Discount must be greater than 0');
    if (Number(minAmount) < 0) return toast.error('Min amount cannot be negative');

    try {
      setLoading(true);

      const codeQuery = query(
        collection(db, 'coupons'),
        where('code', '==', code.trim().toUpperCase())
      );
      const snapshot = await getDocs(codeQuery);
      if (!snapshot.empty) {
        setLoading(false);
        return toast.error('Coupon with this code already exists!');
      }

      await addDoc(collection(db, 'coupons'), {
        code: code.trim().toUpperCase(),
        discountType,
        discount: Number(discount),
        minAmount: minAmount ? Number(minAmount) : 0,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      toast.success('Coupon added!');
      setForm({ code: '', discount: '', discountType: 'percent', minAmount: '' });
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to add coupon');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Coupon deleted');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error('Error deleting coupon');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-20 px-4 py-8 bg-white shadow rounded">
      <h2 className="text-xl font-bold text-indigo-700 mb-6">Manage Coupons</h2>

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap gap-4 items-center mb-8"
      >
        <input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="Coupon Code"
          className="border p-2 rounded w-32"
        />
        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="border p-2 rounded w-32"
        >
          <option value="percent">Percent (%)</option>
          <option value="flat">Flat ₹</option>
        </select>
        <input
          type="number"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          placeholder="Discount"
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          value={form.minAmount}
          onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
          placeholder="Min ₹"
          className="border p-2 rounded w-24"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Coupon'}
        </button>
      </form>

      {coupons.length === 0 ? (
        <p className="text-gray-500">No coupons available.</p>
      ) : (
        <div className="space-y-3 h-screen">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="border p-4 rounded flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{coupon.code}</p>
                <p className="text-sm text-gray-600">
                  {coupon.discountType === 'flat'
                    ? `Flat ₹${coupon.discount}`
                    : `${coupon.discount}% off`}
                </p>
                <p className="text-xs text-gray-500">
                  Min Order: ₹{coupon.minAmount || 0}
                </p>
              </div>
              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
