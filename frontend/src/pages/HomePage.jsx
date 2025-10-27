import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";

const categories = [
  { href: "/category/facials", name: "Facials", imageUrl: "/face.jpg" },
  { href: "/category/bath", name: "Bath & Body", imageUrl: "/bath.jpeg" },
  { href: "/category/hair", name: "Hair Care", imageUrl: "/hair.jpg" },
  { href: "/category/accessories", name: "Accessories", imageUrl: "/chapsticks.webp" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, loading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-lime-400 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest eco-friendly skincare products
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="relative overflow-hidden bg-gray-800 rounded-lg hover:scale-105 transition-transform duration-300"
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-xl font-semibold text-white capitalize">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {!loading && products.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-contain bg-white"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-lime-400 text-xl font-bold">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
