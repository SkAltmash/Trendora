// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);

  // 🧠 Sync cart with Firestore
  useEffect(() => {
    if (currentUser) {
      const cartRef = doc(db, 'carts', currentUser.uid);
      const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCart(data.items || []);
        }
      });
      return () => unsubscribe();
    } else {
      setCart([]);
    }
  }, [currentUser]);

  // 🔄 Update Firestore on cart change
  const updateCartInFirestore = async (updatedCart) => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'carts', currentUser.uid), {
        uid: currentUser.uid,
        items: updatedCart,
      });
    } catch (err) {
      console.error('❌ Error updating cart:', err);
    }
  };

  // ➕ Add item to cart
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    let updatedCart;

    if (existing) {
      updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    updateCartInFirestore(updatedCart);
    toast.success('Added to cart');
  };

  // ➖ Remove item from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    updateCartInFirestore(updatedCart);
    toast.success('Removed from cart');
  };

  // 🔁 Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    updateCartInFirestore(updatedCart);
  };

  // 🧹 Clear cart after order
  const clearCart = async () => {
    setCart([]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'carts', currentUser.uid), {
          uid: currentUser.uid,
          items: [],
        });
      } catch (err) {
        console.error('❌ Failed to clear cart in Firestore:', err);
      }
    }
    toast.info('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart, // ✅ Expose to use in Checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
