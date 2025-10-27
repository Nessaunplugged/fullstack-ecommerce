import mongoose from "mongoose";
import Product from "./models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const products = [
  // Facials
  {
    name: "24K Under Eye Patches",
    description:
      "Luxurious gold under eye patches for reducing puffiness and dark circles",
    price: 47984,
    image: "/24k under eye patch.webp",
    category: "facials",
    stock: 15,
    isFeatured: true,
  },
  {
    name: "Anua Heartleaf Pore Cleanser",
    description:
      "Gentle pore cleanser with heartleaf extract for sensitive skin",
    price: 63984,
    image: "/anua heartleaf pore cleanser.webp",
    category: "facials",
    stock: 8,
    isFeatured: false,
  },
  {
    name: "CeraVe Moisturizer",
    description: "Daily facial moisturizer with ceramides and hyaluronic acid",
    price: 39984,
    image: "/ceraVe moisturizer.webp",
    category: "facials",
    stock: 12,
    isFeatured: true,
  },
  {
    name: "Jumiso Serum",
    description: "Vitamin C brightening serum for glowing skin",
    price: 55984,
    image: "/jumiso serum.webp",
    category: "facials",
    stock: 6,
    isFeatured: false,
  },
  {
    name: "Medicube Collagen",
    description: "Anti-aging collagen treatment for firmer skin",
    price: 73584,
    image: "/medicube collagen.webp",
    category: "facials",
    stock: 0,
    isFeatured: false,
  },
  {
    name: "Pimple Patches",
    description: "Hydrocolloid patches for acne treatment",
    price: 20784,
    image: "/pimple patch.webp",
    category: "facials",
    stock: 25,
    isFeatured: true,
  },

  // Hair
  {
    name: "Hair Treatment Mask",
    description: "Deep conditioning mask for damaged hair",
    price: 46384,
    image: "/hair.jpg",
    category: "hair",
    stock: 10,
    isFeatured: false,
  },
  {
    name: "Nourishing Hair Oil",
    description: "Natural hair oil for shine and strength",
    price: 36784,
    image: "/hair.jpg",
    category: "hair",
    stock: 7,
    isFeatured: true,
  },

  // Bath
  {
    name: "Tree Hut Coco Colada Sugar Scrub",
    description: "Exfoliating sugar scrub with coconut scent",
    price: 30384,
    image: "/tree hut coco colada sugar scrub.webp",
    category: "bath",
    stock: 14,
    isFeatured: false,
  },
  {
    name: "Luxury Bath Set",
    description: "Complete bath set with bath bombs and salts",
    price: 57584,
    image: "/bath.jpeg",
    category: "bath",
    stock: 5,
    isFeatured: true,
  },

  // Accessories
  {
    name: "Baimei Gua Sha & Jade Roller",
    description: "Facial massage tools for lymphatic drainage",
    price: 31984,
    image: "/Baimei icyme gua sha and jade roller.webp",
    category: "accessories",
    stock: 20,
    isFeatured: false,
  },
  {
    name: "Medicube Pore Pad",
    description: "Exfoliating pads for pore care",
    price: 29184,
    image: "/medicube pore pad.webp",
    category: "accessories",
    stock: 11,
    isFeatured: true,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    await Product.insertMany(products);
    console.log("Products seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
