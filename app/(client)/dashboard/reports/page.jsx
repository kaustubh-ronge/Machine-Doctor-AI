import { checkUser } from "@/lib/checkUser";
import { getAllReports } from "@/actions/reportActions";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Search, Filter } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AllReportsPage() {
  // 1. Auth Check
  const user = await checkUser();
  if (!user) redirect("/");

  // 2. Fetch All Data
  const reports = await getAllReports();

  return (
    <div className="px-6 pt-6 space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Report Archive</h1>
          <p className="text-slate-400 mt-1">
            View and download diagnostic history for all your machinery.
          </p>
        </div>
        
        {/* Simple Search UI (Visual only for now) */}
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Search reports..." 
                    className="pl-9 bg-slate-900 border-slate-800 text-slate-200 focus:border-blue-500"
                />
            </div>
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-300">
                <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <CardContent className="p-0">
            {reports.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    No reports found. Start a scan to generate data.
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400 pl-6">Machine Name</TableHead>
                        <TableHead className="text-slate-400">Analysis Type</TableHead>
                        <TableHead className="text-slate-400">Health Score</TableHead>
                        <TableHead className="text-slate-400">Risk Assessment</TableHead>
                        <TableHead className="text-slate-400 hidden md:table-cell">Date Created</TableHead>
                        <TableHead className="text-right text-slate-400 pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => {
                        // Dynamic Styling Logic
                        let scoreColor = "text-green-500";
                        let badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
                        
                        if ((report.healthScore || 0) < 50) {
                            scoreColor = "text-red-500";
                            badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                        } else if ((report.healthScore || 0) < 80) {
                            scoreColor = "text-yellow-500";
                            badgeColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                        }

                        return (
                            <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors group">
                                
                                {/* Machine Info */}
                                <TableCell className="font-medium text-slate-200 pl-6">
                                    <div className="flex flex-col">
                                        <span className="text-base">{report.machine.name}</span>
                                        <span className="text-xs text-slate-500 font-mono">{report.machine.modelNumber}</span>
                                    </div>
                                </TableCell>

                                {/* Type */}
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 hover:bg-slate-700">
                                        {report.type === "MANUAL_ENTRY" ? "Manual Input" : "File Upload"}
                                    </Badge>
                                </TableCell>

                                {/* Score */}
                                <TableCell>
                                    <span className={`text-lg font-bold ${scoreColor}`}>
                                        {report.healthScore}%
                                    </span>
                                </TableCell>

                                {/* Risk */}
                                <TableCell>
                                    <Badge variant="outline" className={`${badgeColor} border px-3`}>
                                        {report.riskLevel}
                                    </Badge>
                                </TableCell>

                                {/* Date */}
                                <TableCell className="hidden md:table-cell text-slate-400 text-sm">
                                    {format(new Date(report.createdAt), "PPP")}
                                </TableCell>

                                {/* Action Button */}
                                <TableCell className="text-right pr-6">
                                    <Link href={`/dashboard/reports/${report.id}`}>
                                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all">
                                            View Report
                                        </Button>
                                    </Link>
                                </TableCell>

                            </TableRow>
                        );
                        })}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}