import React from 'react';
import '../styles/skeleton.css'; // Ensure you have the shine animation styles

const SkeletonCard = () => (
  <div className="w-40 h-64 bg-gray-200 rounded-lg animate-shine" />
);

const SkeletonCategory = () => (
  <div className="h-32 rounded-lg bg-gray-200 animate-shine w-full md:w-1/2 lg:w-1/4" />
);

const MainpageSkeleton = () => {
  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white min-h-screen px-4 py-10">
      {/* Hero Skeleton */}
      <div className="h-96 w-full bg-gray-200 animate-shine rounded-lg mb-10" />

      {/* Promo Banner Skeleton */}
      <div className="w-full h-10 bg-gray-200 animate-shine rounded mb-10" />

      {/* Category Blocks Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[...Array(4)].map((_, i) => (
          <SkeletonCategory key={i} />
        ))}
      </div>

      {/* Men’s Collection Skeleton */}
      <div className="mb-10">
        <div className="h-6 w-40 bg-gray-200 animate-shine mb-6 rounded" />
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={`men-${i}`} />
          ))}
        </div>
      </div>

      {/* Women’s Collection Skeleton */}
      <div className="mb-10">
        <div className="h-6 w-40 bg-gray-200 animate-shine mb-6 rounded" />
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={`women-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainpageSkeleton;
