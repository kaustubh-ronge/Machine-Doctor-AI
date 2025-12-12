import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ArrowRight, FileText } from "lucide-react";

export default function RecentReports({ reports }) {
  if (reports.length === 0) return null;

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800/50">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent AI Scans
        </CardTitle>
        
        {/* --- LINK TO THE NEW PAGE --- */}
        <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </Link>
      </CardHeader>
      
      {/* ... Rest of the table code remains exactly as provided previously ... */}
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 pl-4">Machine</TableHead>
              <TableHead className="text-slate-400">Score</TableHead>
              <TableHead className="text-slate-400">Risk Level</TableHead>
              <TableHead className="text-slate-400 hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right text-slate-400 pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
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
                <TableRow key={report.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-200 pl-4">
                    <div className="flex flex-col">
                        <span>{report.machine.name}</span>
                        <span className="text-xs text-slate-500">{report.machine.modelNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                        <span className={`text-lg font-bold ${scoreColor}`}>{report.healthScore}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${badgeColor} border`}>
                        {report.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-400 text-sm">
                    {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Link href={`/dashboard/report/${report.id}`}>
                        <Button size="sm" variant="ghost" className="hover:bg-blue-600 hover:text-white text-slate-400">
                            <FileText className="w-4 h-4" />
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}