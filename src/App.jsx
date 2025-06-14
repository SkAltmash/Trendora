import React from 'react';
import Mainpage from './pages/Mainpage';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 
import { AuthProvider } from './context/AuthContext';
import ProfileSetup from './pages/profile-setup';
import Productpage from './pages/Productpage';
import Footer from './components/Footer';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminProducts from './pages/Admin/AdminProducts';
import AddProduct from './pages/Admin/AddProduct';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import { FavoriteProvider } from './context/FavoriteContext'; 
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <AuthProvider> 
    <CartProvider> 
    <FavoriteProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/cart" element={<CartPage />} /> 
        <Route path="/product/:id" element={<ProductDetail />} />
         <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/products" element={<Productpage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
       <Route path="/profile" element={<ProfilePage />} />
     <Route path="/admin/orders" element={<AdminOrders />} />
       <Route path='/admin/products' element ={<AdminProducts />} />
       <Route path='/admin/add' element={<AddProduct />}></Route>
      <Route path="/admin/user" element={<AdminUsers />} />

       <Route path="/admin/dashboard" element={<AdminDashboard />} />
       <Route path="/favorites" element={<FavoritesPage />} />

      </Routes>
        <Footer />

      <ToastContainer // ✅ Add Toast container
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </FavoriteProvider>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
