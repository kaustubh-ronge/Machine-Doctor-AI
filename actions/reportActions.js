"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// 1. Fetch only the 5 most recent (for Dashboard widget)
export async function getRecentReports() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5, 
      include: {
        machine: {
          select: { name: true, modelNumber: true }
        }
      }
    });
    return reports;
  } catch (error) {
    console.error("Failed to fetch recent reports:", error);
    return [];
  }
}

// 2. Fetch ALL reports (for the Reports Page)
export async function getAllReports() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      // No 'take' limit, or set a high limit like 100
      include: {
        machine: {
          select: { name: true, modelNumber: true }
        }
      }
    });
    return reports;
  } catch (error) {
    console.error("Failed to fetch all reports:", error);
    return [];
  }
}