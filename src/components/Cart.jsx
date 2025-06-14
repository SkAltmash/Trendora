import React from 'react';
import { Link } from 'react-router-dom';

function Cart({ item }) {
  return (
    <Link to={`/product/${item.id}`}>
      <div className="w-40 md:w-55 rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition duration-300 cursor-pointer">
        <img
          className="w-full h-68 md:h-78 object-cover"
          src={item.mainImage}
          alt={item.title}
        />
        <div className="px-4 py-3">
          <div className="font-bold text-lg mb-1 text-gray-800 truncate" title={item.title}>
            {item.title}
          </div>
          <p className="text-indigo-600 font-semibold text-md">₹{item.price}</p>
        </div>
      </div>
    </Link>
  );
}

export default Cart;
