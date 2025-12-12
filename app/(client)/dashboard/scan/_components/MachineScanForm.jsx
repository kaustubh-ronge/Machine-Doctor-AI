
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2, UploadCloud, CheckCircle, Thermometer, Activity,
  Volume2, Gauge, Clock, AlertTriangle, Eye, Server, MapPin, Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { analyzeMachine } from "@/actions/aiActions"; // Ensure path is correct
import useFetch from "@/hooks/use-fetch";

export default function NewScanForm({ machines, userCredits = 0, userPlan = "FREE" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("preselect");

  const [selectedMachine, setSelectedMachine] = useState(preselectedId || "");
  const [submissionType, setSubmissionType] = useState("FILE_UPLOAD");
  const [loadValue, setLoadValue] = useState([50]);

  const { fn: analyzeFn, loading, data: result, error: fetchError } = useFetch(analyzeMachine);

  // Logic: Check Credits
  const isPro = userPlan === "PRO";
  const hasCredits = userCredits > 0;
  const canScan = isPro || hasCredits;

  // --- RESULT HANDLING ---
  useEffect(() => {
    // 1. Success Case
    if (result?.success && result?.reportId) {
      toast.success("Analysis Complete!");
      router.push(`/dashboard/reports/${result.reportId}`);
    }
    // 2. Specific Logic Failure (returned from Server Action)
    else if (result?.success === false) {
      toast.error(result.error || "Analysis failed. Please try again.");
    }
  }, [result, router]);

  // --- NETWORK ERROR HANDLING ---
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError.message || "Network error. Please try again.");
    }
  }, [fetchError]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canScan) {
      toast.error("Insufficient credits. Please upgrade.");
      router.push("/pricing");
      return;
    }

    if (!selectedMachine) {
      toast.error("Please select an asset first.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("machineId", selectedMachine);
    formData.append("submissionType", submissionType);
    formData.append("operating_load", loadValue[0]);

    // Trigger the server action
    await analyzeFn(formData);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* --- A. SELECT ASSET --- */}
          <div className="space-y-3">
            <Label className="text-slate-200 text-base">Select Asset / Machine</Label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine} required>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 h-12">
                <SelectValue placeholder="Choose asset to diagnose..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                {machines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} <span className="text-slate-500 text-xs ml-2">({m.modelNumber || "N/A"})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* --- B. INPUT METHOD --- */}
          <div className="space-y-4">
            <Tabs defaultValue="FILE_UPLOAD" onValueChange={setSubmissionType} className="w-full">

              {/* UPDATED TABS LIST: Stacks on mobile (grid-cols-1), Side-by-side on Desktop (md:grid-cols-2) */}
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 bg-slate-950 border border-slate-800 h-auto md:h-12 p-1 gap-2 md:gap-0">
                <TabsTrigger
                  value="FILE_UPLOAD"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-10 md:h-full rounded-md"
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> Upload Logs/Docs
                </TabsTrigger>
                <TabsTrigger
                  value="MANUAL_ENTRY"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-10 md:h-full rounded-md"
                >
                  <Activity className="w-4 h-4 mr-2" /> Manual Diagnostics
                </TabsTrigger>
              </TabsList>

              {/* FILE UPLOAD TAB */}
              <TabsContent value="FILE_UPLOAD" className="mt-6 animate-in fade-in slide-in-from-top-2">
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-blue-500/50 transition-colors bg-slate-950/50 relative">
                  <Input type="file" name="file" accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <div className="flex flex-col items-center gap-4 z-10">
                    <UploadCloud className="w-10 h-10 text-blue-400" />
                    <div className="text-slate-300">
                      <span className="text-blue-400 font-semibold">Upload Maintenance Log</span> or Invoice
                    </div>
                    <p className="text-xs text-slate-500">PDF, JPG, PNG supported</p>
                  </div>
                </div>
              </TabsContent>

              {/* UNIVERSAL MANUAL ENTRY TAB */}
              <TabsContent value="MANUAL_ENTRY" className="mt-6 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-8 p-6 rounded-lg border border-slate-800 bg-slate-950/50">
                  {/* 1. Core Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">1. Core Telemetry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-400" /> Primary Metric (Temp/CPU)</Label>
                        <Input name="primary_metric" placeholder="e.g. 85°C or 90% CPU" className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><Gauge className="w-4 h-4 text-purple-400" /> Secondary Metric (Press/RAM)</Label>
                        <Input name="secondary_metric" placeholder="e.g. 2000 RPM" className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                    </div>
                  </div>
                  {/* 2. Operational */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">2. Operational Context</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Operating Load ({loadValue}%)</Label>
                        <Slider defaultValue={[50]} max={100} step={1} onValueChange={setLoadValue} className="py-4" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4 text-green-400" /> Runtime / Uptime</Label>
                        <Input name="runtime" placeholder="e.g. 240 Hours" className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                    </div>
                  </div>
                  {/* 3. Signals */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">3. Signals & Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Error Codes</Label>
                        <Input name="error_codes" placeholder="e.g. E-404" className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><Volume2 className="w-4 h-4" /> Noise / Vibration</Label>
                        <Select name="noise_profile">
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100"><SelectValue placeholder="Select observation" /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="Silent/Normal">Silent / Normal</SelectItem>
                            <SelectItem value="Intermittent Clicking">Intermittent Clicking</SelectItem>
                            <SelectItem value="Constant Hum">Constant Hum</SelectItem>
                            <SelectItem value="Grinding/Loud">Grinding / Loud Friction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* 4. Environment */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">4. Environment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4" /> Condition</Label>
                        <Select name="env_condition">
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100"><SelectValue placeholder="Select condition" /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                            <SelectItem value="Clean/Controlled">Clean / Controlled</SelectItem>
                            <SelectItem value="Dusty/Industrial">Dusty / Industrial</SelectItem>
                            <SelectItem value="Outdoor/Humid">Outdoor / Humid</SelectItem>
                            <SelectItem value="High Heat">High Heat Area</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 flex items-center gap-2"><Eye className="w-4 h-4" /> Visual Inspection</Label>
                        <Input name="visual_signs" placeholder="e.g. Leaks, Rust" className="bg-slate-900 border-slate-700 text-slate-100" />
                      </div>
                    </div>
                  </div>
                  {/* 5. Notes */}
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <Label className="text-slate-300">Detailed Notes</Label>
                    <Textarea name="textInput" placeholder="Describe the issue..." className="min-h-25 bg-slate-900 border-slate-700 text-slate-200" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* --- C. SUBMIT BUTTON (WITH CREDIT CHECK) --- */}
          {canScan ? (
            <Button type="submit" disabled={loading} className="w-full bg-linear-to-r from-blue-600 to-cyan-600 text-white h-12 text-lg font-medium shadow-lg hover:scale-[1.01] transition-transform">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> AI Analyzing (Auto-Retrying if busy)...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Run Universal Analysis</>}
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Button type="button" onClick={() => router.push("/pricing")} className="w-full bg-slate-800 text-slate-400 h-12 text-lg font-medium border border-slate-700 hover:bg-slate-800 hover:text-red-400 cursor-not-allowed">
                <Lock className="w-5 h-5 mr-2" /> Insufficient Credits
              </Button>
              <div className="text-center">
                <Link href="/pricing" className="text-blue-400 hover:underline text-sm font-medium">Buy more credits to continue using AI</Link>
              </div>
            </div>
          )}

        </form>
      </CardContent>
    </Card>
  );
}