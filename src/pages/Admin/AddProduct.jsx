import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    price: '',
    quantity: '',
    category: 'tshirt',
    gender: 'men',
    mainImage: '',
    images: ['', '', '', '', '', ''],
    inStock: true,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newProduct = {
        ...form,
        id: Number(form.id),
        price: Number(form.price),
        quantity: Number(form.quantity),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), newProduct);
      alert('Product added successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Error adding product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 mt-20 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="id" type="number" placeholder="Product ID" required value={form.id} onChange={handleChange} className="p-2 border rounded" />
          <input name="title" placeholder="Product Title" required value={form.title} onChange={handleChange} className="p-2 border rounded" />
          <input name="price" type="number" placeholder="Price ₹" required value={form.price} onChange={handleChange} className="p-2 border rounded" />
          <input name="quantity" type="number" placeholder="Quantity" required value={form.quantity} onChange={handleChange} className="p-2 border rounded" />

          <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded">
            <option value="tshirt">T-shirt</option>
            <option value="joggers">Joggers</option>
          </select>

          <select name="gender" value={form.gender} onChange={handleChange} className="p-2 border rounded">
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        {/* Main Image */}
        <div>
          <label className="block font-medium mb-1">Main Image URL</label>
          <input
            name="mainImage"
            placeholder="assets/30/30.1.webp"
            value={form.mainImage}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          {form.mainImage && (
            <img src={`${form.mainImage.trim()}`} alt="Main Preview" className="h-40 rounded border object-cover" />
          )}
        </div>

        {/* All Images */}
        <div>
          <label className="block font-medium mb-2">Product Images (6 URLs)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {form.images.map((img, index) => (
              <div key={index}>
                <input
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder={`Image ${index + 1}`}
                  className="w-full p-2 border rounded mb-1"
                />
                {img && (
                  <img
                    src={`${img.trim()}`}
                    alt={`Preview ${index + 1}`}
                    className="h-50 w-50 object-cover rounded border"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* In Stock Checkbox */}
        <label className="flex items-center gap-2 mt-4">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} />
          <span>In Stock</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
