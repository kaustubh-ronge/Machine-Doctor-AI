"use client";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ReportPrintButton({ contentRef }) {
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Diagnostic_Report",
  });

  return (
    <Button 
      onClick={handlePrint} 
      className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
    >
      <Download className="w-4 h-4" /> Download PDF
    </Button>
  );
}