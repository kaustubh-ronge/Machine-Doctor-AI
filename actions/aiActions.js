// "use server";

// import { checkUser } from "@/lib/checkUser";
// import { prisma } from "@/lib/prisma";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { revalidatePath } from "next/cache";

// /**
//  * Helper: Convert File to Base64 for Gemini
//  */
// async function fileToGenerativePart(file) {
//   const arrayBuffer = await file.arrayBuffer();
//   return {
//     inlineData: {
//       data: Buffer.from(arrayBuffer).toString("base64"),
//       mimeType: file.type,
//     },
//   };
// }

// export async function analyzeMachine(formData) {
//   console.log("\n--- [ACTION: analyzeMachine] Universal Request ---");

//   try {
//     // 1. Auth Check
//     const user = await checkUser();
//     if (!user) throw new Error("Authentication failed.");

//     // 2. Credit Logic (FIXED)
//     // If plan is NOT 'PRO' AND credits are less than 1, block them.
//     if (user.plan !== "PRO" && user.credits < 1) {
//       throw new Error("Insufficient credits. Please upgrade or top up.");
//     }

//     // 3. API Key Check
//     if (!process.env.GEMINI_API_KEY) throw new Error("CRITICAL: GEMINI_API_KEY is not configured.");

//     // 4. Initialize Gemini (Using 1.5-Flash for speed & cost)
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // 5. Extract Form Data
//     const machineId = formData.get("machineId");
//     const submissionType = formData.get("submissionType");
//     const file = formData.get("file");

//     if (!machineId) throw new Error("Asset ID is required.");
//     const machine = await prisma.machine.findUnique({ where: { id: machineId } });
//     if (!machine) throw new Error("Asset not found in database.");

//     // --- BUILD UNIVERSAL CONTEXT ---
//     let diagnosticContext = "";

//     if (submissionType === "MANUAL_ENTRY") {
//       // Gathering all fields from the universal form
//       const primary = formData.get("primary_metric") || "N/A";
//       const secondary = formData.get("secondary_metric") || "N/A";
//       const load = formData.get("operating_load") || "Unknown";
//       const runtime = formData.get("runtime") || "Unknown";
//       const errors = formData.get("error_codes") || "None";
//       const noise = formData.get("noise_profile") || "Normal";
//       const env = formData.get("env_condition") || "Standard";
//       const visual = formData.get("visual_signs") || "None";
//       const notes = formData.get("textInput") || "None";

//       diagnosticContext = `
//         UNIVERSAL DIAGNOSTIC DATA:
//         - Primary Metric (Temp/CPU/Flow): ${primary}
//         - Secondary Metric (Press/RAM/RPM): ${secondary}
//         - Operational Load: ${load}%
//         - Runtime / Uptime: ${runtime}
//         - Error Codes / Digital Alerts: ${errors}
//         - Acoustic / Physical Profile: ${noise}
//         - Environment: ${env}
//         - Visual Inspection Signs: ${visual}
//         - User Notes: "${notes}"
//         `;
//     }

//     // --- THE MEGA PROMPT ---
//     let promptParts = [];
//     const systemPrompt = `
//       You are a Universal Diagnostic AI capable of analyzing Industrial Machines, IT Servers, Vehicles, or Medical Devices.

//       ASSET PROFILE: 
//       - Name: ${machine.name} 
//       - Type: ${machine.type || "General Asset"}
//       - Model: ${machine.modelNumber || "N/A"}

//       INPUT DATA: ${submissionType === "MANUAL_ENTRY" ? diagnosticContext : "See attached maintenance logs/documents."}

//       INSTRUCTIONS:
//       1. Determine the asset class based on the context (e.g., if data says "CPU Temp", treat as Server; if "Vibration", treat as Mechanical).
//       2. Analyze the data for failure patterns specific to that asset class.
//       3. Output a detailed JSON report.

//       OUTPUT JSON STRUCTURE (Strictly JSON):
//       {
//         "healthScore": (Integer 0-100),
//         "riskLevel": ("LOW" | "MODERATE" | "HIGH" | "CRITICAL"),
//         "executiveSummary": "Brief executive summary of asset health.",
//         "technicalAnalysis": {
//             "rootCauseHypothesis": "Technical explanation of the likely root cause.",
//             "potentialFailureModes": ["Mode 1", "Mode 2"],
//             "symptomsAnalyzed": ["Symptom 1", "Symptom 2"]
//         },
//         "riskAssessment": {
//             "safetyHazards": "Safety risks to personnel or data.",
//             "operationalImpact": "Impact on production or service availability.",
//             "probabilityOfFailure": "Probability estimate (e.g., High, <24hrs)."
//         },
//         "maintenancePlan": {
//             "immediateActions": ["Step 1", "Step 2"],
//             "preventiveMeasures": ["Long term prevention step"],
//             "sparePartsRequired": ["List parts or software patches needed"]
//         }
//       }
//     `;

//     promptParts.push(systemPrompt);

//     if (submissionType === "FILE_UPLOAD" && file && file.size > 0) {
//       const imagePart = await fileToGenerativePart(file);
//       promptParts.push(imagePart);
//     }

//     // 6. Call Gemini
//     const result = await model.generateContent(promptParts);
//     const text = result.response.text();

//     // Clean JSON (remove markdown code blocks if AI adds them)
//     const cleanedJson = text.replace(/```(?:json)?\n?/g, "").trim();
//     const aiData = JSON.parse(cleanedJson);

//     // 7. Save to Database
//     const newReport = await prisma.report.create({
//       data: {
//         userId: user.id,
//         machineId,
//         type: submissionType,
//         manualInputText: submissionType === "MANUAL_ENTRY" ? diagnosticContext : "File Upload",

//         status: "COMPLETED",
//         healthScore: aiData.healthScore,
//         riskLevel: aiData.riskLevel,
//         summary: aiData.executiveSummary,
//         recommendations: aiData.maintenancePlan.immediateActions,

//         // Save full structure for the Tabbed View
//         rawAiResponse: aiData,

//         costInCredits: 1
//       }
//     });

//     // 8. Deduct Credit (Only if not PRO)
//     if (user.plan !== "PRO") {
//       await prisma.user.update({
//         where: { id: user.id },
//         data: { credits: { decrement: 1 } }
//       });
//     }

//     revalidatePath("/dashboard");
//     return { success: true, reportId: newReport.id };

//   } catch (error) {
//     console.error("AI ERROR:", error);
//     return { success: false, error: error.message || "Analysis failed." };
//   }
// }


"use server";

import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

/**
 * Helper: Convert File to Base64 for Gemini
 */
async function fileToGenerativePart(file) {
  const arrayBuffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: file.type,
    },
  };
}

export async function analyzeMachine(formData) {
  console.log("\n--- [ACTION: analyzeMachine] Universal Request ---");

  try {
    // 1. Auth Check
    const user = await checkUser();
    if (!user) throw new Error("Authentication failed.");

    // 2. Credit Logic
    // Allow if PRO, OR if user has credits.
    if (user.plan !== "PRO" && user.credits < 1) {
      throw new Error("Insufficient credits. Please upgrade or top up.");
    }

    // 3. API Key Check
    if (!process.env.GEMINI_API_KEY) throw new Error("CRITICAL: GEMINI_API_KEY is not configured.");

    // 4. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: You could switch to 'gemini-1.5-pro' here if user.plan === "PRO" for even better results!
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 5. Extract Form Data
    const machineId = formData.get("machineId");
    const submissionType = formData.get("submissionType");
    const file = formData.get("file");

    if (!machineId) throw new Error("Asset ID is required.");
    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw new Error("Asset not found in database.");

    // --- BUILD CONTEXT ---
    let diagnosticContext = "";

    if (submissionType === "MANUAL_ENTRY") {
      const primary = formData.get("primary_metric") || "N/A";
      const secondary = formData.get("secondary_metric") || "N/A";
      const load = formData.get("operating_load") || "Unknown";
      const runtime = formData.get("runtime") || "Unknown";
      const errors = formData.get("error_codes") || "None";
      const noise = formData.get("noise_profile") || "Normal";
      const env = formData.get("env_condition") || "Standard";
      const visual = formData.get("visual_signs") || "None";
      const notes = formData.get("textInput") || "None";

      diagnosticContext = `
        UNIVERSAL DIAGNOSTIC DATA:
        - Primary Metric: ${primary}
        - Secondary Metric: ${secondary}
        - Operational Load: ${load}%
        - Runtime: ${runtime}
        - Error Codes: ${errors}
        - Acoustic: ${noise}
        - Environment: ${env}
        - Visual Signs: ${visual}
        - User Notes: "${notes}"
        `;
    }

    // --- TIERED PROMPT LOGIC (The Key Update) ---
    // We adjust the AI's persona based on the plan
    const isPro = user.plan === "PRO";

    const persona = isPro
      ? "You are a Chief Reliability Engineer (CMRP Certified) with 20 years of experience. Provide deep Root Cause Failure Analysis (RCFA), cite ISO standards where applicable, and focus on long-term asset reliability."
      : "You are a Shift Maintenance Technician. Provide a quick, practical diagnosis focusing on immediate symptoms and standard quick fixes. Keep explanations simple.";

    const depthInstruction = isPro
      ? "Analyze specifically for complex failure modes, cross-referencing multiple variables. Provide detailed prevention strategies."
      : "Identify the most obvious failure mode based on the symptoms. Provide standard immediate actions.";

    // --- THE MEGA PROMPT ---
    let promptParts = [];
    const systemPrompt = `
      ${persona}
      
      ASSET PROFILE: 
      - Name: ${machine.name} 
      - Type: ${machine.type || "General Asset"}
      - Model: ${machine.modelNumber || "N/A"}
      
      INPUT DATA: ${submissionType === "MANUAL_ENTRY" ? diagnosticContext : "See attached maintenance logs/documents."}

      INSTRUCTIONS:
      1. Determine the asset class.
      2. ${depthInstruction}
      3. Output a detailed JSON report.

      OUTPUT JSON STRUCTURE (Strictly JSON):
      {
        "healthScore": (Integer 0-100),
        "riskLevel": ("LOW" | "MODERATE" | "HIGH" | "CRITICAL"),
        "executiveSummary": "Summary of asset health.",
        "technicalAnalysis": {
            "rootCauseHypothesis": "Technical explanation.",
            "potentialFailureModes": ["Mode 1", "Mode 2"],
            "symptomsAnalyzed": ["Symptom 1", "Symptom 2"]
        },
        "riskAssessment": {
            "safetyHazards": "Safety risks.",
            "operationalImpact": "Production impact.",
            "probabilityOfFailure": "Probability estimate."
        },
        "maintenancePlan": {
            "immediateActions": ["Step 1", "Step 2"],
            "preventiveMeasures": ["Prevention 1"],
            "sparePartsRequired": ["Parts needed"]
        }
      }
    `;

    promptParts.push(systemPrompt);

    if (submissionType === "FILE_UPLOAD" && file && file.size > 0) {
      const imagePart = await fileToGenerativePart(file);
      promptParts.push(imagePart);
    }

    // 6. Call Gemini
    const result = await model.generateContent(promptParts);
    const text = result.response.text();

    // Clean JSON
    const cleanedJson = text.replace(/```(?:json)?\n?/g, "").trim();
    const aiData = JSON.parse(cleanedJson);

    // 7. Save to Database
    const newReport = await prisma.report.create({
      data: {
        userId: user.id,
        machineId,
        type: submissionType,
        manualInputText: submissionType === "MANUAL_ENTRY" ? diagnosticContext : "File Upload",

        status: "COMPLETED",
        healthScore: aiData.healthScore,
        riskLevel: aiData.riskLevel,
        summary: aiData.executiveSummary,
        recommendations: aiData.maintenancePlan.immediateActions,

        // Save full structure
        rawAiResponse: aiData,

        costInCredits: 1
      }
    });

    // 8. Deduct Credit (If not PRO)
    if (!isPro) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
      });
    }

    revalidatePath("/dashboard");
    return { success: true, reportId: newReport.id };

  } catch (error) {
    console.error("AI ERROR:", error);
    return { success: false, error: error.message || "Analysis failed." };
  }
}