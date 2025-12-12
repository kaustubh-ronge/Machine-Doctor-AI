"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resumePayment, generateReceipt } from "@/actions/paymentActions";
import Script from "next/script";
import { toast } from "sonner";

export default function PaymentsListClient({ transactions = [] }) {
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  const handleResume = async () => {
    setLoadingResume(true);
    const res = await resumePayment();
    setLoadingResume(false);

    if (!res.success) {
      toast.error(res.error || "No pending payment found");
      return;
    }

    // Open Razorpay modal using existing order id
    if (typeof window !== "undefined" && res.orderId) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: res.orderId,
        amount: res.transaction?.amount ? res.transaction.amount * 100 : undefined,
        currency: "INR",
        name: "Machine Doctor AI",
        description: "Resume Payment",
        
        // --- ADDED CONFIGURATION HERE ---
        config: {
          display: {
            hide: [
              { method: "emi" },
              { method: "wallet" },
              { method: "paylater" }
            ],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        // -------------------------------

        handler: function (response) {
          toast.success("Payment handled — please refresh to update status.");
          // Ideally, trigger a server verification action here if needed, 
          // or rely on the webhook/manual refresh as per your current flow.
          window.location.reload(); 
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  const openReceipt = async (id) => {
    const res = await generateReceipt(id);
    if (!res.success) return toast.error(res.error || "Unable to load receipt");
    setActiveReceipt(res.receipt);
  };

  const downloadReceipt = (receipt) => {
    const html = `
      <html>
        <head><title>Receipt - ${receipt.id}</title></head>
        <body>
          <h2>Machine Doctor AI — Receipt</h2>
          <p><strong>ID:</strong> ${receipt.id}</p>
          <p><strong>User:</strong> ${receipt.user.name || receipt.user.email}</p>
          <p><strong>Amount:</strong> ₹${receipt.amount}</p>
          <p><strong>Status:</strong> ${receipt.status}</p>
          <p><strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleString()}</p>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (!w) return toast.error("Unable to open print window");
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  return (
    <div className="space-y-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {transactions.length === 0 ? (
        <div className="text-slate-400">No transactions found.</div>
      ) : (
        <div className="grid gap-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded border border-slate-800 bg-slate-900">
              <div>
                <div className="text-sm text-slate-300 font-medium">{tx.planType || (tx.creditsAdded > 0 ? 'Credit Pack' : 'Payment')}</div>
                <div className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-white">₹{tx.amount}</div>
                <Button variant="ghost" onClick={() => openReceipt(tx.id)}>View Invoice</Button>
                {tx.status === "PENDING" && (
                  <Button onClick={handleResume} disabled={loadingResume}>{loadingResume ? "Resuming..." : "Resume"}</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!activeReceipt} onOpenChange={(open) => { if (!open) setActiveReceipt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Download or print your receipt below.</DialogDescription>
          </DialogHeader>

          {activeReceipt && (
            <div className="mt-4 space-y-3">
              <div><strong>ID:</strong> {activeReceipt.id}</div>
              <div><strong>User:</strong> {activeReceipt.user.name || activeReceipt.user.email}</div>
              <div><strong>Amount:</strong> ₹{activeReceipt.amount}</div>
              <div><strong>Status:</strong> {activeReceipt.status}</div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => downloadReceipt(activeReceipt)}>Download / Print</Button>
                <Button variant="secondary" onClick={() => setActiveReceipt(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}