"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Make sure to install this
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import { addMachine } from "@/actions/machineActions";
import useFetch from "@/hooks/use-fetch"; 

export default function AddMachineModal() {
  const [open, setOpen] = useState(false);
  const { fn: addMachineFn, loading, data: result } = useFetch(addMachine);

  useEffect(() => {
    if (result?.success) {
      setOpen(false);
    }
  }, [result]);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await addMachineFn(formData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/20">
          <PlusCircle className="w-4 h-4" />
          Add Machine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Machine</DialogTitle>
          <DialogDescription className="text-slate-400">
            Register a new equipment to the AI monitoring system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          
          {/* Machine Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-200">Machine Name <span className="text-red-400">*</span></Label>
            <Input id="name" name="name" placeholder="e.g. Hydraulic Press 01" className="bg-slate-900 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20" required />
          </div>
          
          {/* Type & Model (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="type" className="text-slate-200">Type</Label>
                <Input id="type" name="type" placeholder="e.g. Press" className="bg-slate-900 border-slate-800 focus:border-blue-500" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="modelNumber" className="text-slate-200">Model No.</Label>
                <Input id="modelNumber" name="modelNumber" placeholder="XYZ-900" className="bg-slate-900 border-slate-800 focus:border-blue-500" />
            </div>
          </div>

          {/* Install Date */}
          <div className="grid gap-2">
            <Label htmlFor="installDate" className="text-slate-200">Installation Date</Label>
            <Input id="installDate" name="installDate" type="date" className="bg-slate-900 border-slate-800 focus:border-blue-500 invert-calendar-icon" />
          </div>

          {/* Technical Specs (Text Area) */}
          <div className="grid gap-2">
            <Label htmlFor="specifications" className="text-slate-200">Technical Specs / Notes</Label>
            <Textarea 
                id="specifications" 
                name="specifications" 
                placeholder="Voltage, Max RPM, Maintenance Interval notes..." 
                className="bg-slate-900 border-slate-800 focus:border-blue-500 min-h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white min-w-[35">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
              Save Machine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}