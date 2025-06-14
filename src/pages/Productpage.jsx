import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Cart from '../components/Cart';
import { useSearchParams } from 'react-router-dom';
import ProductPageSkeleton from '../components/ProductPageSkeleton';
function Productpage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [loading, setLoading] = useState(true);
  const [hideFilters, setHideFilters] = useState(false); // ✅ New

  // Fetch products
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
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    const genderFromUrl = searchParams.get('gender');
    const categoryFromUrl = searchParams.get('category');

    if (genderFromUrl || categoryFromUrl) {
      setHideFilters(true); // ✅ Hide filters if query present
      if (genderFromUrl) setSelectedGender(genderFromUrl);
      if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
    }

    let result = [...products];

    if (genderFromUrl || categoryFromUrl) {
      // only use filters from URL if available
      if (genderFromUrl) result = result.filter(p => p.gender === genderFromUrl);
      if (categoryFromUrl) result = result.filter(p => p.category === categoryFromUrl);
    } else {
      // use filters from UI selection
      if (selectedGender !== 'All') result = result.filter(p => p.gender === selectedGender);
      if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    }

    if (sortOrder === 'lowToHigh') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'highToLow') result.sort((a, b) => b.price - a.price);

    setFilteredProducts(result);
  }, [products, selectedGender, selectedCategory, sortOrder, searchParams]);

  const categories = ['All', ...new Set(products.map((item) => item.category))];
  const genders = ['All', ...new Set(products.map((item) => item.gender))];

  const heading =
    hideFilters && selectedGender !== 'All' && selectedCategory !== 'All'
      ? `${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}'s ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`
      : 'All Products';

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600 mt-10">{heading}</h1>

      {/* Filters */}
      {!hideFilters && (
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 flex-wrap">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm shadow-sm"
          >
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort by Price */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm shadow-sm"
          >
            <option value="default">Sort by Price</option>
            <option value="lowToHigh">Low → High</option>
            <option value="highToLow">High → Low</option>
          </select>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (<ProductPageSkeleton/>
      ) : filteredProducts.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {filteredProducts.map((item) => (
            <Cart key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </div>
  );
}

export default Productpage;
