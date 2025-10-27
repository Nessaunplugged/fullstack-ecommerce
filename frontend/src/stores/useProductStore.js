import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const mockProducts = {
  facials: [
    { _id: '1', name: '24K Under Eye Patches', price: 29.99, image: '/24k under eye patch.webp', stock: 15, category: 'facials' },
    { _id: '2', name: 'Anua Heartleaf Pore Cleanser', price: 39.99, image: '/anua heartleaf pore cleanser.webp', stock: 8, category: 'facials' },
    { _id: '3', name: 'CeraVe Moisturizer', price: 24.99, image: '/ceraVe moisturizer.webp', stock: 12, category: 'facials' },
    { _id: '4', name: 'Jumiso Serum', price: 34.99, image: '/jumiso serum.webp', stock: 6, category: 'facials' },
    { _id: '5', name: 'Medicube Collagen', price: 45.99, image: '/medicube collagen.webp', stock: 0, category: 'facials' },
    { _id: '6', name: 'Pimple Patches', price: 12.99, image: '/pimple patch.webp', stock: 25, category: 'facials' }
  ],
  hair: [
    { _id: '7', name: 'Hair Treatment Mask', price: 28.99, image: '/hair.jpg', stock: 10, category: 'hair' },
    { _id: '8', name: 'Nourishing Hair Oil', price: 22.99, image: '/hair.jpg', stock: 7, category: 'hair' }
  ],
  bath: [
    { _id: '9', name: 'Tree Hut Coco Colada Sugar Scrub', price: 18.99, image: '/tree hut coco colada sugar scrub.webp', stock: 14, category: 'bath' },
    { _id: '10', name: 'Luxury Bath Set', price: 35.99, image: '/bath.jpeg', stock: 5, category: 'bath' }
  ],
  accessories: [
    { _id: '11', name: 'Baimei Gua Sha & Jade Roller', price: 19.99, image: '/Baimei icyme gua sha and jade roller.webp', stock: 20, category: 'accessories' },
    { _id: '12', name: 'Medicube Pore Pad', price: 16.99, image: '/medicube pore pad.webp', stock: 11, category: 'accessories' }
  ]
};

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      // Try to fetch from backend first
      const response = await axios.get('/products/featured');
      set({ products: response.data.products || response.data, loading: false });
    } catch (error) {
      // Fallback to mock data
      const featuredProducts = Object.values(mockProducts).flat().slice(0, 6);
      set({ products: featuredProducts, loading: false });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      // Try to fetch from backend first
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products || response.data, loading: false });
    } catch (error) {
      // Fallback to mock data
      const categoryProducts = mockProducts[category] || [];
      set({ products: categoryProducts, loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/products');
      set({ products: response.data.products || response.data, loading: false });
    } catch (error) {
      const allProducts = Object.values(mockProducts).flat();
      set({ products: allProducts, loading: false });
      toast.error('Failed to fetch products from server, showing sample data');
    }
  },

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/products', productData);
      set((state) => ({
        products: [...state.products, response.data],
        loading: false
      }));
      toast.success('Product created successfully!');
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || 'Failed to create product');
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId)
      }));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
      throw error;
    }
  },

  toggleFeaturedProduct: async (productId) => {
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId ? response.data : product
        )
      }));
      toast.success('Product updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
      throw error;
    }
  },

  updateStock: async (productId, stock) => {
    try {
      const response = await axios.put(`/products/${productId}/stock`, { stock });
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId ? { ...product, stock } : product
        ),
      }));
      toast.success('Stock updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update stock');
      throw error;
    }
  },

  updatePrice: async (productId, price) => {
    try {
      const response = await axios.put(`/products/${productId}/price`, { price });
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId ? { ...product, price } : product
        ),
      }));
      toast.success('Price updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update price');
      throw error;
    }
  },
}));