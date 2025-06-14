import React from 'react';
import '../styles/skeleton.css'; 

const ProductDetailSkeleton = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 mt-20 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Skeleton */}
        <div className="md:w-1/2 w-full space-y-4">
          <div className="w-full h-130 bg-gray-200 rounded shimmer" />
          <div className="flex gap-2 overflow-auto">
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="w-20 h-20 bg-gray-200 rounded shimmer" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 shimmer" />
          <div className="h-5 bg-gray-200 rounded w-1/2 shimmer" />
          <div className="h-5 bg-gray-200 rounded w-1/3 shimmer" />
          <div className="h-5 bg-gray-200 rounded w-1/4 shimmer" />
          <div className="h-10 bg-gray-300 rounded w-full shimmer mt-6" />
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-6 shimmer" />
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="w-40 md:w-52 h-72 bg-gray-200 rounded shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
