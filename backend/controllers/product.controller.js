import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllproducts = async (req, res) => {
  try {
    const cachedProducts = await redis.get("products");
    if (cachedProducts) {
      return res.json({ products: JSON.parse(cachedProducts) });
    }
    console.log("Cache miss");
    const products = await Product.find({});
    await redis.set("products", JSON.stringify(products));
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json({ products: JSON.parse(featuredProducts) });
    }

    // if not found in redis, fetch from mongo database
    //  .() returns plain javascript instead of mongodb document
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ error: "No featured products found" });
    }
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json({ products: featuredProducts });
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ error: " Server Error", error: error.message });
  }
};

export const createproduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category,
      stock
    });
    
    // Update cache
    await updateProductsCache();
    
    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createproduct controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; 

      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error.message);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    // Update cache
    await updateProductsCache();
    await updatedFeaturedProductsCache();
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};


export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1
        }
      }
    ]);

    res.json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const {category} = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updatedFeaturedProductsCache();
      await updateProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      { stock }, 
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Update cache
    await updateProductsCache();
    
    res.json(product);
  } catch (error) {
    console.log("Error in updateStock controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

export const updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    if (price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      { price }, 
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Update cache
    await updateProductsCache();
    
    res.json(product);
  } catch (error) {
    console.log("Error in updatePrice controller", error.message);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

async function updatedFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating featured products cache", error.message);
  }
}

async function updateProductsCache() {
  try {
    const products = await Product.find({}).lean();
    await redis.set("products", JSON.stringify(products));
  } catch (error) {
    console.log("Error updating products cache", error.message);
  }
}