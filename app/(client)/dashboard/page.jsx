import { checkUser } from "@/lib/checkUser";
import { getMachines } from "@/actions/machineActions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, FileClock, Zap, Shield } from "lucide-react";
import AddMachineModal from "./_components/AddMachineModal";
import MachineCard from "./_components/MachineCard";

export default async function DashboardPage() {
  const user = await checkUser();
  if (!user) redirect("/");

  const machines = await getMachines();

  return (
    <div className="px-7 overflow-hidden pt-5 space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400">Overview of your connected machinery.</p>

            {/* CREDIT STATUS BADGE */}
            {user.plan === "PRO" ? (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1 hover:bg-yellow-500/20">
                <Shield className="w-3 h-3" /> PRO Enterprise
              </Badge>
            ) : (
              <Badge variant="outline" className={`${user.credits < 3 ? "text-red-400 border-red-400/50" : "text-blue-400 border-blue-400/50"} gap-1`}>
                <Zap className="w-3 h-3" /> {user.credits} Credits Left
              </Badge>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reports">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              <FileClock className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </Link>
          <AddMachineModal />
        </div>
      </div>

      {/* Content Section */}
      {machines.length === 0 ? (
        <div className="min-h-100 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 text-center p-8">
          <div className="p-4 rounded-full bg-slate-800 mb-4 shadow-inner">
            <Cpu className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Machines Added</h3>
          <p className="text-slate-400 max-w-sm mb-6 text-sm">
            You haven't added any equipment yet. Add a machine to start tracking its health.
          </p>
          <AddMachineModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}