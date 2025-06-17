import React, { useState } from 'react';
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CheckoutPage() {
  const { cart = [], clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState('idle');

  const totalPrice = cart?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  ) || 0;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'flat') {
      discount = appliedCoupon.discount;
    } else if (appliedCoupon.discountType === 'percent') {
      discount = (totalPrice * appliedCoupon.discount) / 100;
    }
    if (totalPrice < appliedCoupon.minAmount) {
      discount = 0;
    }
  }

  const finalPrice = Math.max(totalPrice - discount, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setCouponStatus('applying');
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'coupons'),
          where('code', '==', couponCode.trim().toUpperCase()),
          where('isActive', '==', true)
        )
      );

      if (!snapshot.empty) {
        const coupon = snapshot.docs[0].data();
        if (totalPrice < coupon.minAmount) {
          toast.error(`Minimum order ₹${coupon.minAmount} required for this coupon`);
          setCouponStatus('error');
          return;
        }
        setAppliedCoupon(coupon);
        setCouponStatus('success');
        toast.success('Coupon Applied!');
      } else {
        setAppliedCoupon(null);
        setCouponStatus('error');
        toast.error('Invalid or expired coupon');
      }
    } catch (err) {
      console.error(err);
      setCouponStatus('error');
      toast.error('Failed to apply coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) return toast.error('Please enter your address.');
    try {
      setPlacingOrder(true);

      // Check stock for all items
      for (const item of cart) {
        const productQuery = query(
          collection(db, 'products'),
          where('id', '==', item.id)
        );
        const querySnapshot = await getDocs(productQuery);

        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data();
          if (productData.quantity < item.quantity) {
            setPlacingOrder(false);
            toast.error(`Not enough stock for "${item.title}". Only ${productData.quantity} left.`);
            return;
          }
        } else {
          setPlacingOrder(false);
          toast.error(`Product "${item.title}" not found.`);
          return;
        }
      }

      // Create order, but do not reduce product quantity
      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        email: currentUser.email,
        cart,
        totalAmount: finalPrice,
        address,
        paymentMethod,
        status: 'pending',
        createdAt: Timestamp.now(),
        couponCode: appliedCoupon?.code || null,
        discountValue: discount,
        discountType: appliedCoupon?.discountType || null,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Order failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mt-20">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Checkout</h2>

      <div className="flex items-center gap-3 text-green-600 text-sm mb-6 border p-3 rounded bg-green-50 shadow-sm w-fit">
        <img
          src="https://img.icons8.com/color/48/lock--v1.png"
          alt="secure"
          className="w-5 h-5"
        />
        <span>
          <strong className="text-black">TRENDORA</strong> ensures 100% Secure Payment
        </span>
      </div>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <p>{item.title} (x{item.quantity})</p>
                <p>₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">Coupon Code</label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="border p-2 rounded w-full"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={couponStatus === 'applying'}
              >
                {couponStatus === 'applying'
                  ? 'Applying...'
                  : couponStatus === 'success'
                  ? 'Applied ✅'
                  : 'Apply'}
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-green-600 mt-2 text-sm">
                Coupon <strong>{appliedCoupon.code}</strong> applied -{' '}
                {appliedCoupon.discountType === 'flat'
                  ? `₹${appliedCoupon.discount} off`
                  : `${appliedCoupon.discount}% off`}
              </p>
            )}
          </div>

          <div className="text-right mt-4">
            <p className="text-lg text-gray-700 line-through">Total: ₹{totalPrice}</p>
            {appliedCoupon ? (
              <p className="text-xl font-bold text-green-700">Final: ₹{finalPrice}</p>
            ) : (
              <p className="text-xl font-bold text-indigo-700">Total: ₹{totalPrice}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              rows="4"
              placeholder="Enter your full delivery address..."
            />
          </div>

          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">Payment Method</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="radio"
                  value="prepaid"
                  checked={paymentMethod === 'prepaid'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled
                />
                UPI / Card / Netbanking (coming soon)
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className={`mt-6 px-6 py-2 w-full bg-green-600 text-white font-semibold rounded hover:bg-green-700 ${
              placingOrder ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {placingOrder ? 'Placing Order...' : `Place Order - ₹${finalPrice}`}
          </button>
        </>
      )}
    </div>
  );
}

export default CheckoutPage;
