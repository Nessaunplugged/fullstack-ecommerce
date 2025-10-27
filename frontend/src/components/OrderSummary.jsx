import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51SCgvVIrOV5L15XHx5bYn3Pm0idpMVkaiYSuEnM8PoQnKX9bbgjlNKpL0ccuvicjKCnKT8w9Y6bbNfujYLUTblFV00WD4VE1UP"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    console.log("Checkout button clicked");
    console.log("Cart:", cart);
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading Stripe...");
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Stripe failed to load");
        setIsLoading(false);
        return;
      }
      console.log("Stripe loaded successfully");

      console.log("Creating checkout session...");
      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
      });
      console.log("Checkout session response:", res.data);

      const session = res.data;
      console.log("Redirecting to Stripe checkout...");
      
      // Get the checkout URL from the session and redirect
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("No checkout URL received from server");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      console.error("Error response:", error.response?.data);
      if (error.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Make sure your backend is running on port 5000.");
      } else if (error.name === 'IntegrationError') {
        // Handle Stripe integration errors
        toast.error("Stripe integration error. Please try again.");
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to create checkout session";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-lime-400">Order summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dd className="text-base font-medium text-white">
              ₦{formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-lime-400">
                -₦{formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-lime-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-lime-400">
              ₦{formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-lime-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-lime-700 focus:outline-none focus:ring-4 focus:ring-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          onClick={handlePayment}
          disabled={isLoading || cart.length === 0}
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-lime-400 underline hover:text-lime-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default OrderSummary;
