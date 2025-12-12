"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(planType, amount, credits) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // 1. Create Order in Razorpay
    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit (Paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 2. Create Pending Transaction in DB
    await prisma.transaction.create({
      data: {
        userId,
        amount: amount,
        planType: planType, // "STANDARD" or "PRO"
        creditsAdded: credits,
        razorpayOrderId: order.id,
        status: "PENDING",
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function verifyPayment(response) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

  // 1. Verify Signature (Security Check)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // Flag transaction as failed
    await prisma.transaction.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: "FAILED" },
    });
    return { success: false, error: "Invalid Signature" };
  }

  // 2. Success! Update DB
  try {
    // A. Update Transaction Status
    const transaction = await prisma.transaction.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: { 
        status: "SUCCESS", 
        razorpayPaymentId: razorpay_payment_id 
      },
    });

    // B. Add Credits / Update Plan for User
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: transaction.creditsAdded },
        plan: transaction.planType || undefined, // Update plan if planType exists
      },
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("DB Update Error:", error);
    return { success: false, error: "Payment verified but DB update failed" };
  }
}

export async function getUserTransactions() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // Newest first
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// Fetch all transactions for current user (most recent first)
// Fetch all transactions but hide duplicate PENDING entries
// Fetch all transactions but hide duplicate/stale PENDING entries
export async function getTransactions() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    // 1. Fetch ALL transactions sorted by newest first
    const allTx = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Filter logic
    const resolvedPlans = new Set();

    const cleanedTx = allTx.filter((tx) => {
      // A) ALWAYS keep SUCCESS or FAILED transactions for history
      if (tx.status === "SUCCESS") {
        // If we see a SUCCESS, mark this plan as "resolved" 
        // so any OLDER pending attempts for this plan get hidden.
        if (tx.planType) resolvedPlans.add(tx.planType);
        return true;
      }
      
      if (tx.status === "FAILED") {
         return true; 
      }

      // B) Handle PENDING transactions
      if (tx.status === "PENDING") {
        // If we have already seen a newer SUCCESS or PENDING for this plan, hide this one.
        if (tx.planType && resolvedPlans.has(tx.planType)) {
          return false; // SKIP: This is a stale duplicate
        }
        
        // Otherwise, show it, and mark plan as seen/resolved
        if (tx.planType) resolvedPlans.add(tx.planType);
        return true;
      }

      return true;
    });

    return cleanedTx;

  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

// Return the most recent pending transaction for the user (if any)
export async function getPendingTransaction() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    return await prisma.transaction.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch pending transaction:", error);
    return null;
  }
}

// Resume a pending payment by returning the existing Razorpay order id and transaction
export async function resumePayment() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const tx = await prisma.transaction.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (!tx) return { success: false, error: "No pending transaction found" };

    return { success: true, orderId: tx.razorpayOrderId, transaction: tx };
  } catch (error) {
    console.error("Failed to resume payment:", error);
    return { success: false, error: "Server error" };
  }
}

// Get a single transaction by id (for invoice/receipt rendering)
export async function getTransactionById(id) {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!tx || tx.userId !== userId) return null;
    return tx;
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return null;
  }
}

// Simple receipt payload generator (returns JSON invoice data)
export async function generateReceipt(transactionId) {
  const tx = await getTransactionById(transactionId);
  if (!tx) return { success: false, error: "Transaction not found" };

  const receipt = {
    id: tx.id,
    user: { email: tx.user?.email || "", name: `${tx.user?.firstName || ""} ${tx.user?.lastName || ""}`.trim() },
    amount: tx.amount,
    planType: tx.planType || null,
    creditsAdded: tx.creditsAdded,
    status: tx.status,
    razorpayOrderId: tx.razorpayOrderId,
    razorpayPaymentId: tx.razorpayPaymentId,
    createdAt: tx.createdAt,
  };

  return { success: true, receipt };
}