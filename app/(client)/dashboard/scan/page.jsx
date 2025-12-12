import { checkUser } from "@/lib/checkUser";
import { getMachines } from "@/actions/machineActions";
import { redirect } from "next/navigation";
import NewScanForm from "./_components/MachineScanForm";
// Ensure this path points to where you saved the form component


export default async function NewScanPage() {
  const user = await checkUser();
  if (!user) redirect("/");

  const machines = await getMachines();
  if (machines.length === 0) redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">New Health Scan</h1>
        <p className="text-slate-400 mt-2">
          Universal Diagnostic Tool: Upload logs, invoices, or enter manual telemetry.
        </p>
      </div>

      {/* Pass Credits & Plan to the Form */}
      <NewScanForm
        machines={machines}
        userCredits={user.credits}
        userPlan={user.plan}
      />
    </div>
  );
}