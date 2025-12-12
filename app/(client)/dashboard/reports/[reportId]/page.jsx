import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportClientView from "../_components/ReportClientView";

export default async function ReportPage({ params }) {
  const user = await checkUser();
  if (!user) redirect("/");

  const { reportId } = await params;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { machine: true },
  });

  if (!report) return <div>Report not found.</div>;

  return <ReportClientView report={report} />;
}