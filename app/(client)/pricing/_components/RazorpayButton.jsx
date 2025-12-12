"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { createOrder, verifyPayment } from "@/actions/paymentActions";
import { useRouter } from "next/navigation";

export default function RazorpayButton({ planName, amount, credits, children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    // 1. Create Order
    const result = await createOrder(planName, amount, credits);
    
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    // 2. Open Razorpay Modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "Machine Doctor AI",
      description: `Purchase ${planName} Plan`,
      order_id: result.orderId,
      
      // --- NEW CONFIGURATION START ---
      // This block restricts the payment methods
      config: {
        display: {
          hide: [
            { method: "emi" },
            { method: "wallet" },
            { method: "paylater" }
          ],
          preferences: {
            show_default_blocks: true, // Keep the default UI for the allowed methods
          },
        },
      },
      // --- NEW CONFIGURATION END ---

      handler: async function (response) {
        // 3. Verify Payment on Server
        const verifyResult = await verifyPayment(response);
        if (verifyResult.success) {
          toast.success("Payment Successful! Credits Added.");
          router.refresh(); // Update credits in UI
        } else {
          toast.error("Payment Verification Failed");
        }
      },
      prefill: {
        name: "", 
        email: "",
      },
      theme: {
        color: "#2563EB", // Blue-600
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    rzp1.on("payment.failed", function (response) {
      toast.error("Payment Failed: " + response.error.description);
    });
    
    setLoading(false);
  };

  return (
    <>
      {/* Load Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <Button 
        onClick={handlePayment} 
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
        {children || "Upgrade Now"}
      </Button>
    </>
  );
}