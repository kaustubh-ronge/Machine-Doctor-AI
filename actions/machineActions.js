"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { machineSchema } from "@/lib/schemas";

/**
 * Helper to clean form data
 * Converts empty strings or nulls to undefined
 */
function clean(value) {
    if (!value || value === "null" || value === "") return undefined;
    return value;
}

export async function addMachine(formData) {
    const actionName = "[addMachine]";
    console.log(`${actionName} START request...`);

    // 1. Check Auth
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        console.error(`${actionName} ❌ Unauthorized`);
        return { success: false, error: "Unauthorized" };
    }

    // 2. Extract & Sanitize Data
    // We use clean() to fix the "received null" error
    const rawData = {
        name: formData.get("name"),
        type: clean(formData.get("type")),
        modelNumber: clean(formData.get("modelNumber")),
        installDate: clean(formData.get("installDate")),
        specifications: clean(formData.get("specifications")),
    };

    console.log(`${actionName} 📥 Processed Input:`, JSON.stringify(rawData, null, 2));

    // 3. Validate
    const validated = machineSchema.safeParse(rawData);

    if (!validated.success) {
        console.error(`${actionName} ❌ Validation Failed:`, validated.error.flatten().fieldErrors);
        return { success: false, error: validated.error.flatten().fieldErrors };
    }

    try {
        // 4. Create in DB
        await prisma.machine.create({
            data: {
                name: validated.data.name,
                type: validated.data.type,
                modelNumber: validated.data.modelNumber,
                installDate: validated.data.installDate ? new Date(validated.data.installDate) : null,
                // We store specifications as a simple JSON object for now
                specifications: validated.data.specifications ? { notes: validated.data.specifications } : {},
                userId: clerkUserId,
            },
        });

        console.log(`${actionName} ✅ Success`);
        revalidatePath("/dashboard");
        return { success: true };

    } catch (error) {
        console.error(`${actionName} 💥 DB Error:`, error);
        return { success: false, error: "Database Error" };
    }
}

export async function getMachines() {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        return await prisma.machine.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { reports: true } }
            }
        });
    } catch (error) {
        console.error("Failed to fetch machines:", error);
        return [];
    }
}