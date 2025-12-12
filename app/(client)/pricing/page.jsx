import { checkUser } from "@/lib/checkUser"; // Import this to get user data
import { CheckCircle, Zap, Shield } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RazorpayButton from "./_components/RazorpayButton";

export default async function PricingPage() {
  // 1. Fetch User Data to check current plan
  const user = await checkUser();
  const currentPlan = user?.plan || "FREE"; // Default to FREE if undefined

  const plans = [
    {
      name: "Standard Pack",
      price: 499,
      credits: 20,
      features: [
        "20 AI Analyses / Month",
        "Basic Failure Prediction",
        "PDF Report Download",
        "Email Support"
      ],
      tier: "STANDARD",
      recommended: false
    },
    {
      name: "Pro Enterprise",
      price: 1999,
      credits: 100,
      features: [
        "100 AI Analyses / Month",
        "Advanced Root Cause Analysis",
        "Priority 24/7 Support",
        "Historical Data Trends",
        "Multiple Machine Profiles"
      ],
      tier: "PRO",
      recommended: true
    }
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Start for free, upgrade when you need more power. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- FREE PLAN CARD --- */}
        <Card className={`bg-slate-900 border-slate-800 text-slate-300 relative ${currentPlan === "FREE" ? "border-green-500/50 shadow-lg shadow-green-900/10" : ""}`}>
            <CardHeader>
                <CardTitle className="text-xl text-white">Starter</CardTitle>
                <div className="text-3xl font-bold text-white mt-2">Free</div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> 3 Free AI Credits</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Basic Report</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Community Support</li>
                </ul>
            </CardContent>
            <CardFooter>
                {/* Logic: If Current Plan is FREE, show disabled button */}
                {currentPlan === "FREE" ? (
                    <button className="w-full py-2 rounded-md bg-green-900/20 text-green-400 border border-green-800 cursor-not-allowed font-medium">
                        Current Plan
                    </button>
                ) : (
                    <button className="w-full py-2 rounded-md bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700">
                        Included
                    </button>
                )}
            </CardFooter>
        </Card>

        {/* --- PAID PLANS LOOP --- */}
        {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.tier;

            return (
                <Card key={plan.name} className={`bg-slate-900 border relative ${plan.recommended ? 'border-blue-500 shadow-2xl shadow-blue-900/20 scale-105 z-10' : 'border-slate-800'}`}>
                    
                    {plan.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4">
                            Most Popular
                        </Badge>
                    )}

                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            {plan.name}
                            {plan.tier === "PRO" && <Shield className="w-4 h-4 text-yellow-500" />}
                        </CardTitle>
                        <div className="text-3xl font-bold text-white mt-2">
                            ₹{plan.price}<span className="text-base font-normal text-slate-500">/mo</span>
                        </div>
                    </CardHeader>
                    
                    <CardContent>
                        <ul className="space-y-4 text-sm">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex gap-3 items-center text-slate-300">
                                    <div className="p-1 bg-blue-500/10 rounded-full">
                                        <CheckCircle className="w-3 h-3 text-blue-400" />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </CardContent>

                    <CardFooter>
                        {/* Logic: Show "Current Plan" if matched, else show Razorpay Button */}
                        {isCurrentPlan ? (
                            <button className="w-full py-2 rounded-md bg-green-900/20 text-green-400 border border-green-800 cursor-not-allowed font-medium">
                                Current Active Plan
                            </button>
                        ) : (
                            <RazorpayButton 
                                planName={plan.tier} 
                                amount={plan.price} 
                                credits={plan.credits}
                            >
                                Get {plan.name}
                            </RazorpayButton>
                        )}
                    </CardFooter>
                </Card>
            );
        })}

      </div>
    </div>
  );
}