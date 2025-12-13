
// "use server";

// import { checkUser } from "@/lib/checkUser";
// import { prisma } from "@/lib/prisma";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { revalidatePath } from "next/cache";

// // Helper: Delay function for retries
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Helper: Convert File to Base64 for Gemini
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

//     // 2. Credit Logic
//     if (user.plan !== "PRO" && user.credits < 1) {
//       throw new Error("Insufficient credits. Please upgrade or top up.");
//     }

//     // 3. API Key Check
//     if (!process.env.GEMINI_API_KEY) throw new Error("CRITICAL: GEMINI_API_KEY is not configured.");

//     // 4. Initialize Gemini
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     // switched to 1.5-flash for stability (2.5 doesn't exist yet publicly)
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

//     // 5. Extract Form Data
//     const machineId = formData.get("machineId");
//     const submissionType = formData.get("submissionType");
//     const file = formData.get("file");

//     if (!machineId) throw new Error("Asset ID is required.");
//     const machine = await prisma.machine.findUnique({ where: { id: machineId } });
//     if (!machine) throw new Error("Asset not found in database.");

//     // --- BUILD CONTEXT ---
//     let diagnosticContext = "";

//     if (submissionType === "MANUAL_ENTRY") {
//       const primary = formData.get("primary_metric") || "N/A";
//       // ... (rest of your manual entry logic) ...
//        const secondary = formData.get("secondary_metric") || "N/A";
//        const load = formData.get("operating_load") || "Unknown";
//        const runtime = formData.get("runtime") || "Unknown";
//        const errors = formData.get("error_codes") || "None";
//        const noise = formData.get("noise_profile") || "Normal";
//        const env = formData.get("env_condition") || "Standard";
//        const visual = formData.get("visual_signs") || "None";
//        const notes = formData.get("textInput") || "None";

//        diagnosticContext = `
//          UNIVERSAL DIAGNOSTIC DATA:
//          - Primary Metric: ${primary}
//          - Secondary Metric: ${secondary}
//          - Operational Load: ${load}%
//          - Runtime: ${runtime}
//          - Error Codes: ${errors}
//          - Acoustic: ${noise}
//          - Environment: ${env}
//          - Visual Signs: ${visual}
//          - User Notes: "${notes}"
//          `;
//     }

//     // --- TIERED PROMPT LOGIC ---
//     const isPro = user.plan === "PRO";
//     const persona = isPro
//       ? "You are a Chief Reliability Engineer (CMRP Certified)..."
//       : "You are a Shift Maintenance Technician...";

//     const depthInstruction = isPro
//       ? "Analyze specifically for complex failure modes..."
//       : "Identify the most obvious failure mode...";

//     // --- THE MEGA PROMPT WITH VALIDATION GATE ---
//     let promptParts = [];
//     const systemPrompt = `
//       ${persona}
      
//       ASSET PROFILE: 
//       - Name: ${machine.name} 
//       - Type: ${machine.type || "General Asset"}
      
//       INPUT DATA: ${submissionType === "MANUAL_ENTRY" ? diagnosticContext : "See attached document."}

//       *** CRITICAL INSTRUCTION: VALIDATION GATE ***
//       Before analyzing, you must verify if the INPUT DATA is actually related to industrial machinery, technical maintenance, or engineering logs.
      
//       IF THE INPUT IS IRRELEVANT (e.g., a Resume, Cooking Recipe, Novel, Personal Photo, Homework, or Empty/Gibberish):
//       - Return ONLY this JSON: { "isValid": false, "reason": "The uploaded document appears to be a [Detected Type] and not a technical maintenance log." }

//       IF THE INPUT IS VALID TECHNICAL DATA:
//       - Proceed with the analysis and output the full report JSON.

//       OUTPUT JSON STRUCTURE (Strictly JSON):
//       {
//         "isValid": true,
//         "healthScore": (Integer 0-100),
//         "riskLevel": ("LOW" | "MODERATE" | "HIGH" | "CRITICAL"),
//         "executiveSummary": "Summary of asset health.",
//         "technicalAnalysis": {
//             "rootCauseHypothesis": "Technical explanation.",
//             "potentialFailureModes": ["Mode 1", "Mode 2"],
//             "symptomsAnalyzed": ["Symptom 1", "Symptom 2"]
//         },
//         "riskAssessment": {
//             "safetyHazards": "Safety risks.",
//             "operationalImpact": "Production impact.",
//             "probabilityOfFailure": "Probability estimate."
//         },
//         "maintenancePlan": {
//             "immediateActions": ["Step 1", "Step 2"],
//             "preventiveMeasures": ["Prevention 1"],
//             "sparePartsRequired": ["Parts needed"]
//         }
//       }
//     `;

//     promptParts.push(systemPrompt);

//     if (submissionType === "FILE_UPLOAD" && file && file.size > 0) {
//       const imagePart = await fileToGenerativePart(file);
//       promptParts.push(imagePart);
//     }

//     // 6. Call Gemini (Retry Logic)
//     let text = "";
//     let attempt = 0;
//     while (attempt < 3) {
//       try {
//         const result = await model.generateContent(promptParts);
//         text = result.response.text();
//         break;
//       } catch (error) {
//         attempt++;
//         if (attempt >= 3) throw error;
//         await delay(1000 * attempt);
//       }
//     }

//     // Clean JSON
//     const jsonStart = text.indexOf("{");
//     const jsonEnd = text.lastIndexOf("}");
//     if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON response");
//     const cleanedJson = text.substring(jsonStart, jsonEnd + 1);
    
//     const aiData = JSON.parse(cleanedJson);

//     // --- 7. CHECK VALIDITY (THE FIX) ---
//     // If the AI says the file is invalid, STOP here.
//     if (aiData.isValid === false) {
//         console.warn("Invalid document uploaded:", aiData.reason);
//         // Return error WITHOUT deducting credits or saving to DB
//         return { 
//             success: false, 
//             error: aiData.reason || "The document does not appear to be machine maintenance data." 
//         };
//     }

//     // 8. Save to Database (Only if Valid)
//     const newReport = await prisma.report.create({
//       data: {
//         userId: user.id,
//         machineId,
//         type: submissionType,
//         manualInputText: submissionType === "MANUAL_ENTRY" ? diagnosticContext : "File Upload",
//         status: "COMPLETED",
//         healthScore: aiData.healthScore || 0,
//         riskLevel: aiData.riskLevel || "MODERATE",
//         summary: aiData.executiveSummary || "Analysis completed.",
//         recommendations: aiData.maintenancePlan?.immediateActions || ["See details."],
//         rawAiResponse: aiData,
//         costInCredits: 1
//       }
//     });

//     // 9. Deduct Credit (Only if Valid AND Not Pro)
//     if (!isPro) {
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

// Helper: Delay function for retries
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Convert File to Base64 for Gemini
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
    if (user.plan !== "PRO" && user.credits < 1) {
      throw new Error("Insufficient credits. Please upgrade or top up.");
    }

    // 3. API Key Check
    if (!process.env.GEMINI_API_KEY) throw new Error("CRITICAL: GEMINI_API_KEY is not configured.");

    // 4. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // --- STRICTLY USING 2.5 FLASH AS REQUESTED ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

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

    // --- TIERED PROMPT LOGIC ---
    const isPro = user.plan === "PRO";
    const persona = isPro
      ? "You are a Chief Reliability Engineer (CMRP Certified) with 20 years of experience. Provide deep Root Cause Failure Analysis (RCFA), cite ISO standards where applicable, and focus on long-term asset reliability."
      : "You are a Shift Maintenance Technician. Provide a quick, practical diagnosis focusing on immediate symptoms and standard quick fixes. Keep explanations simple.";

    const depthInstruction = isPro
      ? "Analyze specifically for complex failure modes, cross-referencing multiple variables. Provide detailed prevention strategies."
      : "Identify the most obvious failure mode based on the symptoms. Provide standard immediate actions.";

    // --- THE MEGA PROMPT WITH STRICT VALIDATION GATE ---
    let promptParts = [];
    const systemPrompt = `
      ${persona}
      
      ASSET PROFILE: 
      - Name: ${machine.name} 
      - Type: ${machine.type || "General Asset"}
      
      INPUT DATA: ${submissionType === "MANUAL_ENTRY" ? diagnosticContext : "See attached document."}

      *** STEP 1: THE "IS IT A LOG?" CHECK (CRITICAL) ***
      You are a strict data auditor. You must classify the document type before analyzing.

      REJECT THE DOCUMENT IMMEDIATELY IF IT IS:
      1. A Certificate, Diploma, or Degree (e.g., "Certificate of Completion", "IBM Certified", "Award").
      2. A Resume, CV, or Bio.
      3. A General Article, Whitepaper, or Textbook definition.
      4. A Generic Invoice (unless it lists specific machine parts/repairs).
      
      ACCEPT THE DOCUMENT ONLY IF IT CONTAINS:
      - specific sensor readings (temperature, vibration, pressure).
      - maintenance logs with dates/timestamps.
      - error codes specific to machinery.
      - physical descriptions of damage/repair.

      IF REJECTED:
      - Return ONLY this JSON: { "isValid": false, "reason": "The document appears to be a [Detected Type] (e.g. Certificate/Resume), not machine operational data." }

      *** STEP 2: ANALYSIS (Only if Valid) ***
      If the data describes the STATUS or CONDITION of a physical machine, proceed.
      
      ${depthInstruction}

      OUTPUT JSON STRUCTURE (Strictly JSON):
      {
        "isValid": true,
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

    // 6. Call Gemini (Retaining your Retry Logic)
    let text = "";
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        console.log(`Attempt ${attempt + 1} connecting to Gemini...`);
        const result = await model.generateContent(promptParts);
        text = result.response.text();
        break; 
      } catch (error) {
        attempt++;
        const isOverloaded = error.message?.includes("503") || error.message?.includes("overloaded");
        
        if (isOverloaded && attempt < maxRetries) {
          console.warn(`[Gemini] Attempt ${attempt} failed (Overloaded). Retrying...`);
          await delay(attempt * 1000); 
        } else {
          throw error; 
        }
      }
    }

    // Clean JSON
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON response");
    
    const cleanedJson = text.substring(jsonStart, jsonEnd + 1);
    const aiData = JSON.parse(cleanedJson);

    // --- 7. CHECK VALIDITY (THE FIX) ---
    // This catches the "isValid: false" from the Step 1 prompt
    if (aiData.isValid === false) {
        console.warn("Invalid document rejection:", aiData.reason);
        // Return error WITHOUT deducting credits or saving to DB
        return { 
            success: false, 
            error: aiData.reason || "The document does not appear to be machine maintenance data." 
        };
    }

    // 8. Save to Database (Only if Valid)
    const newReport = await prisma.report.create({
      data: {
        userId: user.id,
        machineId,
        type: submissionType,
        manualInputText: submissionType === "MANUAL_ENTRY" ? diagnosticContext : "File Upload",
        status: "COMPLETED",
        healthScore: aiData.healthScore || 0,
        riskLevel: aiData.riskLevel || "MODERATE",
        summary: aiData.executiveSummary || "Analysis completed.",
        recommendations: aiData.maintenancePlan?.immediateActions || ["See details."],
        rawAiResponse: aiData,
        costInCredits: 1
      }
    });

    // 9. Deduct Credit (Only if Valid AND Not Pro)
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