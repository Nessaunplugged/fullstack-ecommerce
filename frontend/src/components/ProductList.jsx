import { motion } from "framer-motion";
import { Trash, Star, Edit3, Check, X } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useState } from "react";

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products, updateStock, updatePrice } = useProductStore();
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState('');

  const handleEditStock = (productId, currentStock) => {
    setEditingStock(productId);
    setStockValue(currentStock.toString());
  };

  const handleSaveStock = async (productId) => {
    try {
      await updateStock(productId, parseInt(stockValue));
      setEditingStock(null);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleEditPrice = (productId, currentPrice) => {
    setEditingPrice(productId);
    setPriceValue((currentPrice / 100).toFixed(2));
  };

  const handleSavePrice = async (productId) => {
    try {
      const priceInCents = Math.round(parseFloat(priceValue) * 100);
      await updatePrice(productId, priceInCents);
      setEditingPrice(null);
      setPriceValue('');
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setStockValue('');
    setEditingPrice(null);
    setPriceValue('');
  };

  console.log("products", products);

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className=" min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Stock
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Featured
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products?.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover object-center"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {product.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingPrice === product._id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      className="w-20 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-lime-500"
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={() => handleSavePrice(product._id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      ₦{(product.price / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleEditPrice(product._id, product.price)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingStock === product._id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      className="w-16 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-lime-500"
                      min="0"
                    />
                    <button
                      onClick={() => handleSaveStock(product._id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${
                      (product.stock || 0) > 10 ? 'text-lime-400' : 
                      (product.stock || 0) > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {product.stock || 0}
                    </span>
                    <button
                      onClick={() => handleEditStock(product._id, product.stock || 0)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleFeaturedProduct(product._id)}
                  className={`p-1 rounded-full ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-600 text-gray-300"
                  } hover:bg-yellow-500 transition-colors duration-200`}
                >
                  <Star className="h-5 w-5" />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
export default ProductsList;
