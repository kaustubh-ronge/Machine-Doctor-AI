"use client";

import { useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Activity, Thermometer, AlertTriangle, 
  Wrench, FileText, ShieldAlert, Cpu, CheckSquare, Layers 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import ReportPrintButton from "./ReportPrintButton";


export default function ReportClientView({ report }) {
  const printRef = useRef(null); 

  // --- PARSE DATA ---
  const details = report.rawAiResponse || {};
  const technical = details.technicalAnalysis || {};
  const risks = details.riskAssessment || {};
  const plan = details.maintenancePlan || {};
  
  const score = report.healthScore || 0;
  let statusColor = "text-green-500";
  let ringColor = "stroke-green-500";
  if (score < 50) { statusColor = "text-red-500"; ringColor = "stroke-red-500"; }
  else if (score < 80) { statusColor = "text-yellow-500"; ringColor = "stroke-yellow-500"; }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
            <Link href="/dashboard/reports">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            </Link>
            <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                Diagnostic Report <span className="text-slate-500 font-mono text-base sm:text-lg">#{report.id.slice(-6).toUpperCase()}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
                {report.machine.name} • {format(new Date(report.createdAt), "PPP p")}
            </p>
            </div>
        </div>
        {/* PRINT BUTTON */}
        <div className="w-full md:w-auto flex justify-end">
            <ReportPrintButton contentRef={printRef} />
        </div>
      </div>

      {/* =========================================================
          SCREEN VIEW (Hidden when printing)
         ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* --- LEFT SIDE: METRICS --- */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent pointer-events-none" />
                <CardContent className="pt-10 flex flex-col items-center">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" className="stroke-slate-800" strokeWidth="12" fill="none" />
                            {/* Adjusted radius calculation for responsiveness (using percentages mostly works but fixed svg needs care, reverting to previous logic but ensuring container fits) */}
                             <circle cx="50%" cy="50%" r="45%" className={`${ringColor} transition-all duration-1000 ease-out`} strokeWidth="12" fill="none" strokeDasharray="553" strokeDashoffset={553 - (553 * score) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={`text-4xl sm:text-5xl font-bold ${statusColor}`}>{score}%</span>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Health</span>
                        </div>
                    </div>
                    <Badge variant="outline" className={`px-4 py-1 text-sm ${statusColor} border-current mb-6`}>
                        {report.riskLevel} RISK
                    </Badge>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase tracking-wider text-slate-500">Executive Summary</CardTitle></CardHeader>
                <CardContent><p className="text-slate-300 leading-relaxed text-sm">{report.summary || "No summary available."}</p></CardContent>
            </Card>
        </div>

        {/* --- RIGHT SIDE: TABS --- */}
        <div className="lg:col-span-8">
            <Tabs defaultValue="technical" className="w-full">
                {/* Changed h-12 to h-auto and added py-1 to allow wrapping on very small screens */}
                <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 h-auto min-h-12 p-1">
                    <TabsTrigger value="technical" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full py-2 whitespace-normal leading-tight">Technical Analysis</TabsTrigger>
                    <TabsTrigger value="risks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full py-2 whitespace-normal leading-tight">Risk & Safety</TabsTrigger>
                    <TabsTrigger value="plan" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full py-2 whitespace-normal leading-tight">Action Plan</TabsTrigger>
                </TabsList>

                {/* TAB 1: TECHNICAL */}
                <TabsContent value="technical" className="mt-6 space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Cpu className="w-5 h-5 text-purple-400" /> Root Cause Hypothesis</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-300">{technical.rootCauseHypothesis || "Analysis pending..."}</p></CardContent>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white text-base"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Potential Failures</CardTitle></CardHeader>
                            <CardContent><ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">{technical.potentialFailureModes?.map((m, i) => <li key={i}>{m}</li>) || <li>None detected</li>}</ul></CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white text-base"><Activity className="w-4 h-4 text-blue-500" /> Symptoms Analyzed</CardTitle></CardHeader>
                            <CardContent><ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">{technical.symptomsAnalyzed?.map((s, i) => <li key={i}>{s}</li>) || <li>None detected</li>}</ul></CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: RISKS */}
                <TabsContent value="risks" className="mt-6 space-y-6">
                    <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-red-500">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><ShieldAlert className="w-5 h-5 text-red-500" /> Safety Hazards</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-300">{risks.safetyHazards || "None reported."}</p></CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Layers className="w-5 h-5 text-orange-400" /> Operational Impact</CardTitle></CardHeader>
                        <CardContent><p className="text-slate-300">{risks.operationalImpact || "Minimal impact expected."}</p></CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: PLAN */}
                <TabsContent value="plan" className="mt-6 space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><CheckSquare className="w-5 h-5 text-green-500" /> Immediate Actions</CardTitle></CardHeader>
                        <CardContent><ul className="space-y-3">{plan.immediateActions?.map((action, i) => (<li key={i} className="flex gap-3 items-start p-3 rounded bg-slate-950 border border-slate-800/50"><div className="min-w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-500 text-xs font-bold mt-0.5">{i+1}</div><span className="text-slate-300 text-sm">{action}</span></li>)) || <p className="text-slate-500">No actions required.</p>}</ul></CardContent>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white text-base"><Wrench className="w-4 h-4 text-blue-400" /> Spare Parts</CardTitle></CardHeader>
                            <CardContent><ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">{plan.sparePartsRequired?.map((p, i) => <li key={i}>{p}</li>) || <li>None required</li>}</ul></CardContent>
                        </Card>
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle className="flex items-center gap-2 text-white text-base"><FileText className="w-4 h-4 text-slate-400" /> Preventive</CardTitle></CardHeader>
                            <CardContent><ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">{plan.preventiveMeasures?.map((m, i) => <li key={i}>{m}</li>) || <li>Standard maintenance</li>}</ul></CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>

      {/* =========================================================
          PRINT LAYOUT (Visible ONLY in PDF)
         ========================================================= */}
      <div ref={printRef} className="hidden print:block p-8 bg-white text-black">
         {/* ... (Print layout remains unchanged as it is for paper) ... */}
         <div className="flex justify-between border-b-2 border-gray-800 pb-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold">Diagnostic Report</h1>
                <p className="text-sm text-gray-500">Machine Doctor AI</p>
            </div>
            <div className="text-right">
                <h2 className="font-bold">{report.machine.name}</h2>
                <p className="text-sm">{format(new Date(report.createdAt), "PPP")}</p>
            </div>
         </div>

         {/* SCORE CARD */}
         <div className="flex justify-between items-center bg-gray-100 p-4 rounded mb-6 border border-gray-200">
             <div className="text-center">
                 <p className="text-sm font-bold text-gray-500 uppercase">Health Score</p>
                 <p className="text-3xl font-black">{score}%</p>
             </div>
             <div className="text-center">
                 <p className="text-sm font-bold text-gray-500 uppercase">Risk Level</p>
                 <p className="text-xl font-bold">{report.riskLevel}</p>
             </div>
         </div>

         {/* SUMMARY */}
         <div className="mb-6">
             <h3 className="font-bold border-b border-gray-300 mb-2">Executive Summary</h3>
             <p className="text-sm text-gray-800">{report.summary}</p>
         </div>

         {/* TECHNICAL */}
         <div className="mb-6">
             <h3 className="font-bold border-b border-gray-300 mb-2">Technical Analysis</h3>
             <p className="text-sm font-semibold mt-2">Root Cause:</p>
             <p className="text-sm text-gray-800 bg-gray-50 p-2 border border-gray-100">{technical.rootCauseHypothesis}</p>
             <div className="grid grid-cols-2 gap-4 mt-2">
                 <div>
                     <p className="text-sm font-semibold">Potential Failures:</p>
                     <ul className="list-disc pl-4 text-sm text-gray-700">{technical.potentialFailureModes?.map(m => <li key={m}>{m}</li>)}</ul>
                 </div>
                 <div>
                     <p className="text-sm font-semibold">Symptoms:</p>
                     <ul className="list-disc pl-4 text-sm text-gray-700">{technical.symptomsAnalyzed?.map(s => <li key={s}>{s}</li>)}</ul>
                 </div>
             </div>
         </div>

         {/* RISKS */}
         <div className="mb-6">
             <h3 className="font-bold border-b border-gray-300 mb-2">Risk Assessment</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <p className="text-sm font-semibold text-red-800">Hazards:</p>
                     <p className="text-sm text-gray-700">{risks.safetyHazards}</p>
                 </div>
                 <div>
                     <p className="text-sm font-semibold text-orange-800">Impact:</p>
                     <p className="text-sm text-gray-700">{risks.operationalImpact}</p>
                 </div>
             </div>
         </div>

         {/* ACTION PLAN */}
         <div className="mb-6">
             <h3 className="font-bold border-b border-gray-300 mb-2">Action Plan</h3>
             <ul className="list-decimal pl-4 space-y-1 mb-4">
                 {plan.immediateActions?.map(a => <li key={a} className="text-sm font-medium">{a}</li>)}
             </ul>
             <p className="text-sm font-semibold">Required Parts:</p>
             <ul className="list-disc pl-4 text-sm text-gray-700">{plan.sparePartsRequired?.map(p => <li key={p}>{p}</li>)}</ul>
         </div>

         <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
             Generated automatically by Machine Doctor AI
         </div>
      </div>
    </div>
  );
}