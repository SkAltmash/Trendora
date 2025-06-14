import React from 'react';
import { useFavorites } from '../context/FavoriteContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const FavoriteButton = ({ productId, size = 'md', position = 'absolute top-2 right-2' }) => {
  const { favorites, toggleFavorite } = useFavorites();

  const isFavorited = favorites.includes(productId);



  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className={`${
        isFavorited ? 'text-red-500' : 'text-gray-950'
      }  z-10 p-2 rounded-full hover:scale-110 transition duration-200 h-15 '`}
      aria-label="Toggle Favorite"
    >
      <FontAwesomeIcon
        icon={isFavorited ? solidHeart : regularHeart}
        className='w-5'
      />
    </button>
  );
};

export default FavoriteButton;
