"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, FileText, Sparkles } from "lucide-react"; // Added Sparkles
import { format } from "date-fns"; 

export default function MachineCard({ machine }) {
  const reportCount = machine._count?.reports || 0;
  // Simple logic: If latest report exists and is high risk, make it red. 
  // For now, we stick to Active/No Data logic until we have data.
  const statusColor = reportCount > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-slate-800 text-slate-400 border-slate-700";
  const statusText = reportCount > 0 ? "Active" : "No Data";

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300 group overflow-hidden relative flex flex-col h-full">
      
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-white tracking-tight line-clamp-1">
            {machine.name}
          </CardTitle>
          <p className="text-sm text-slate-400 font-mono">
            {machine.modelNumber || "No Model #"}
          </p>
        </div>
        <div className={`p-2 rounded-lg bg-slate-800 ${statusColor}`}>
          <Activity className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid gap-3">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current Status</span>
                <Badge variant="outline" className={`${statusColor} capitalize border`}>
                    {statusText}
                </Badge>
            </div>
            
            <div className="flex items-center text-sm text-slate-400">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                {machine.installDate ? format(new Date(machine.installDate), "PPP") : "N/A"}
            </div>

            <div className="flex items-center text-sm text-slate-400">
                <FileText className="mr-2 h-4 w-4 opacity-70" />
                {reportCount} Reports Generated
            </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 mt-auto gap-3">
        {/* HISTORY LINK */}
        <Link href={`/dashboard/machine/${machine.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                History
            </Button>
        </Link>

        {/* DIRECT SCAN LINK (Passes ID as query param) */}
        <Link href={`/dashboard/scan?preselect=${machine.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Scan
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}