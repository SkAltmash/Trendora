import React from 'react';
import '../styles/skeleton.css'; 

const ProductPageSkeleton = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="h-8 w-48 bg-skeleton mb-6 mx-auto rounded"></div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-skeleton rounded-full" />
        ))}
      </div>

      {/* Product Cards Skeleton */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-40 md:w-52 h-72 bg-white p-3 rounded shadow animate-pulse"
          >
            <div className="h-36 w-full bg-skeleton rounded mb-3"></div>
            <div className="h-4 w-3/4 bg-skeleton rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-skeleton rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
