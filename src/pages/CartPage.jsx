import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { currentUser } = useAuth();

  // Handle guest users
  if (!currentUser) {
    return (
      <div className="text-center mt-20 text-xl text-gray-600">
         Please <Link to="/login" className="text-indigo-600 underline">Login</Link> or{' '}
        <Link to="/signup" className="text-indigo-600 underline">Sign Up</Link> to view your cart.
         <div className='w-full flex justify-center mt-10'>
                  <img src="src/img/emptyCart.png" alt="" className='w-100' />

         </div>
      </div>
    );
  }

  // Handle empty cart
  if (cart.length === 0) {
    return (
      <div className="text-center mt-20 text-xl text-gray-600">
         Your cart is empty
          <div className='w-full flex justify-center mt-10'>
                    <img src="src/img/emptyCart.png" alt="" className='w-100' />
           </div>         
         
      </div>
    );
  }

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto mt-20 px-4 h-screen">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">Your Cart</h2>

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b py-4 gap-4"
        >
          <div className="w-24 h-24 overflow-hidden rounded-lg shadow-md">
            <img
              src={item.mainImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-600">₹{item.price}</p>

            <div className="flex items-center mt-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="px-4 border-t border-b">{item.quantity}</span>
              <button
                className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="text-red-500 hover:underline"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Total and Checkout */}
      <div className="text-right mt-6">
        <p className="text-xl font-bold mb-2">Total: ₹{totalPrice}</p>
        <Link to="/checkout">
  <button className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
    Proceed to Checkout
  </button>
</Link>

      </div>
    </div>
  );
}

export default CartPage;
