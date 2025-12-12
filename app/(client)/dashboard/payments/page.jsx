import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import { getTransactions } from "@/actions/paymentActions";
import PaymentsListClient from "./_components/PaymentsListClient";

export default async function PaymentsPage() {
  const user = await checkUser();
  if (!user) redirect("/");

  const transactions = await getTransactions();

  return (
    <div className="px-7 pt-5 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments & Subscriptions</h1>
          <p className="text-slate-400">Your past purchases, subscriptions and pending payments.</p>
        </div>
      </div>

      <PaymentsListClient transactions={transactions} />
    </div>
  );
}
