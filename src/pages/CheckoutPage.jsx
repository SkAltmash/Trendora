import React, { useState } from 'react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

 const handlePlaceOrder = async () => {
  if (!address.trim()) return alert('Please enter your address.');

  try {
    setPlacingOrder(true);

    // 🔍 Validate all products before placing order
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

    // ✅ Place the order if stock is valid
    await addDoc(collection(db, 'orders'), {
      userId: currentUser.uid,
      email: currentUser.email,
      cart,
      totalAmount: totalPrice,
      address,
      paymentMethod,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // 🔁 Deduct quantity from each product
    for (const item of cart) {
      const productQuery = query(
        collection(db, 'products'),
        where('id', '==', item.id)
      );
      const querySnapshot = await getDocs(productQuery);
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productRef = doc(db, 'products', productDoc.id);
        const productData = productDoc.data();
        const newQty = Math.max(productData.quantity - item.quantity, 0);

        await updateDoc(productRef, { quantity: newQty });
      }
    }

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

  {/* Secure Badge */}
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
          {/* Cart Summary */}
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

          <p className="text-right mt-4 text-xl font-semibold">
            Total: ₹{totalPrice}
          </p>

          {/* Address Field */}
          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              rows="4"
              placeholder="Enter your full delivery address..."
            />
          </div>

          {/* Payment Options */}
          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">
              Payment Method
            </label>
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

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className={`mt-6 px-6 py-2 w-full bg-green-600 text-white font-semibold rounded hover:bg-green-700 ${
              placingOrder ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {placingOrder
              ? 'Placing Order...'
              : `Place Order - ₹${totalPrice}`}
          </button>
        </>
      )}
    </div>
  );
}

export default CheckoutPage;
