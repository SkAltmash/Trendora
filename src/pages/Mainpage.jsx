import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Cart from '../components/Cart';
import '../styles/animatedGradient.css';
import { FaArrowRight } from 'react-icons/fa';
import MainpageSkeleton from '../components/MainpageSkeleton';
const Mainpage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const filterProducts = (gender, category) =>
    products.filter(p => p.gender === gender && p.category === category).slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white min-h-screen text-gray-800 font-sans">
      {loading ? (
       <MainpageSkeleton />
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative animated-gradient text-white py-28 text-center px-4 overflow-hidden">
            <div className="absolute w-80 h-80 bg-purple-400 blur-3xl opacity-30 top-[-100px] right-[-100px] rounded-full z-0" />
            <div className="absolute w-72 h-72 bg-indigo-400 blur-2xl opacity-20 bottom-[-80px] left-[-80px] rounded-full z-0" />
         <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                Style That Speaks
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light drop-shadow-md">
                Premium oversized T-shirts, joggers, and more—crafted for comfort & attitude.
              </p>
              <Link to="/products">
                <button className="bg-white text-indigo-700 px-7 py-3 rounded-full font-semibold text-lg shadow-md hover:scale-105 hover:shadow-xl transition">
                  Explore Collection
                </button>
              </Link>
            </motion.div>
          </section>

          {/* Promo Banner */}
          <section className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-4 px-6 text-center text-white font-medium text-lg shadow-md">
            🚨 Limited Time Offer! Get <span className="font-bold">10% OFF</span> on orders above ₹999 – Use code <span className="font-semibold underline">TREND10</span>
          </section>

          {/* Category Blocks */}
          <section className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-10 text-indigo-700">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { gender: 'men', category: 'tshirt', label: "Men's T-Shirts",imgsrc:"https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-OS-T-shirts-Trending-Category-Icon--1--1748005029.jpg" },
                { gender: 'men', category: 'joggers', label: "Men's Joggers",imgsrc:"https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Joggers-Trending-Category-Icon-1747726637.jpg" },
                { gender: 'women', category: 'tshirt', label: "Women's T-Shirts",imgsrc:"https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-OS-Tshirts-WomenTrending-Category-Icon-1747724475.jpg" },
                { gender: 'women', category: 'joggers', label: "Women's Joggers",imgsrc:"https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Joggers-WomenTrending-Category-Icon-1747724475.jpg" },
              ].map(({ gender, category, label,imgsrc }) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer text-center border-t-4 ${
                    gender === 'men' ? 'border-indigo-500' : 'border-pink-500'
                  }`}
                  key={`${gender}-${category}`}
                >
                  <Link to={`/products?gender=${gender}&category=${category}`}>
                     <img src={imgsrc} alt="" className='object-cover rounded-3xl' />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{label}</h3>
                    <p className="text-gray-500 text-sm">Explore now</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Men's Collection */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto py-20 px-4"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700">Men's Collection</h2>

            {['tshirt', 'joggers'].map(category => (
              <div key={category} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold capitalize text-indigo-700">{category}</h3>
                  <Link
                    to={`/products?gender=men&category=${category}`}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-black transition"
                  >
                    See All <FaArrowRight className="text-xs mt-[1px]" />
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                  {filterProducts('men', category).map(item => (
                    <motion.div whileHover={{ scale: 1.03 }} key={item.id}>
                      <Cart item={item} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>

          {/* Women's Collection */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto py-20 px-4"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-pink-600">Women's Collection</h2>

            {['tshirt', 'joggers'].map(category => (
              <div key={category} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold capitalize text-pink-600">{category}</h3>
                  <Link
                    to={`/products?gender=women&category=${category}`}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-black transition"
                  >
                    See All <FaArrowRight className="text-xs mt-[1px]" />
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                  {filterProducts('women', category).map(item => (
                    <motion.div whileHover={{ scale: 1.03 }} key={item.id}>
                      <Cart item={item} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        </>
      )}
    </div>
  );
};

export default Mainpage;
