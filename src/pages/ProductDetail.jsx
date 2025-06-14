import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import FavoriteButton from '../components/FavoriteButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEye } from '@fortawesome/free-solid-svg-icons';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productQuery = query(
          collection(db, 'products'),
          where('id', '==', Number(id))
        );
        const querySnapshot = await getDocs(productQuery);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setProduct(docData);
          setMainImage(docData.images?.[0]?.trim() || '');
          setCurrentIndex(0);

          const relatedQuery = query(
            collection(db, 'products'),
            where('category', '==', docData.category)
          );
          const relatedSnap = await getDocs(relatedQuery);
          const suggestions = relatedSnap.docs
            .map(doc => doc.data())
            .filter(p => p.id !== docData.id)
            .slice(0, 8);

          setRelatedProducts(suggestions);
        } else {
          setProduct(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsShaking(true);
    addToCart(product);
    setTimeout(() => setIsShaking(false), 600);
  };

  const showPrevImage = () => {
    if (!product?.images?.length) return;
    const newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setCurrentIndex(newIndex);
    setMainImage(product.images[newIndex].trim());
  };

  const showNextImage = () => {
    if (!product?.images?.length) return;
    const newIndex = (currentIndex + 1) % product.images.length;
    setCurrentIndex(newIndex);
    setMainImage(product.images[newIndex].trim());
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) showNextImage(); // swipe left
    else if (diff < -50) showPrevImage(); // swipe right
  };

  if (loading) {
    return  <ProductDetailSkeleton />;
  }

  if (!product) {
    return <div className="text-center mt-10 text-red-500 text-xl">Product not found.</div>;
  }
  window.scrollTo(0, 0); // Scroll to top on product detail page load
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 mt-20">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Section */}
        <div className="md:w-1/2 w-full relative">
          {/* ❤️ Favorite */}
          <div className="absolute top-3 right-3 z-20">
            <FavoriteButton productId={product.id} size="lg" />
          </div>

          {/* ⬅️➡️ Arrows for desktop only */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={showPrevImage}
                className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 rounded-full p-2 shadow z-20 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                onClick={showNextImage}
                className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-white text-gray-700 rounded-full p-2 shadow z-20 hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}

          {/* Main Image with Swipe */}
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={product.id >= 31 ? mainImage : `/${mainImage}`}
              alt={product.title}
              className="w-full h-130 rounded shadow-md object-cover"
            />
            <Link
              to={`/product/${product.id}`}
              className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white text-indigo-600 font-semibold px-4 py-1 rounded-full shadow text-sm flex items-center gap-2 z-10"
            >
              <FontAwesomeIcon icon={faEye} />
              View Product
            </Link>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 mt-4 overflow-auto">
            {product.images?.map((img, index) => {
              const imgSrc = product.id >= 31 ? img.trim() : `/${img.trim()}`;
              return (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`${product.title}-${index}`}
                  className={`w-20 h-20 object-cover border rounded cursor-pointer ${
                    mainImage === img.trim() ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => {
                    setMainImage(img.trim());
                    setCurrentIndex(index);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-indigo-700">{product.title}</h1>
          <p className="text-gray-700 text-lg mb-4">Price: ₹{product.price}</p>
          <p className="text-gray-600 mb-4">
            Category: <span className="capitalize">{product.category}</span>
          </p>
          <p className="text-gray-600 mb-4">Gender: {product.gender}</p>
          <p className="text-gray-600 mb-4">
            Available Quantity: {product.quantity ?? 'N/A'}
          </p>

          {/* Stock Status */}
          {product.quantity === 0 ? (
            <p className="text-red-600 font-semibold mb-2">Out of Stock</p>
          ) : product.quantity < 5 ? (
            <p className="text-yellow-600 font-medium mb-2">
              Hurry! Only {product.quantity} left in stock.
            </p>
          ) : null}

          {/* Add to Cart */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className={`mt-6 px-6 py-2 text-white font-semibold rounded shadow ${
              product.quantity === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            You May Also Like
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {relatedProducts.map(item => (
              <Link to={`/product/${item.id}`} key={item.id}>
                <div className="w-40 md:w-55 rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition duration-300 cursor-pointer">
                  <img
                    className="w-full h-68 md:h-78 object-cover"
                    src={
                      item.id >= 31
                        ? item.mainImage?.trim()
                        : `/${item.mainImage?.trim()}`
                    }
                    alt={item.title}
                  />
                  <div className="px-4 py-3">
                    <div
                      className="font-bold text-lg mb-1 text-gray-800 truncate"
                      title={item.title}
                    >
                      {item.title}
                    </div>
                    <p className="text-indigo-600 font-semibold text-md">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
