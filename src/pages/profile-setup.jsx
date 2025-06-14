import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const avatars = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Finn',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ava',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ruby',
];

function ProfileSetup() {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !selectedAvatar) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        name,
        avatar: selectedAvatar,
        email: currentUser.email,
      });

      toast.success('Profile saved!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error(err);
      toast.error('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Set Up Your Profile
        </h2>

        <input
          type="text"
          className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {avatars.map((url, index) => (
            <div
              key={index}
              className={`rounded-full border-4 p-1 cursor-pointer transition duration-200 ${
                selectedAvatar === url ? 'border-indigo-600' : 'border-transparent'
              }`}
              onClick={() => setSelectedAvatar(url)}
            >
              <img
                src={url}
                alt={`Avatar ${index}`}
                className="w-full h-auto rounded-full"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full font-semibold py-2 px-4 rounded-md transition duration-200 ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8z"
                ></path>
              </svg>
              <span>Saving...</span>
            </span>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
