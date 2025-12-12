import { z } from "zod";

export const machineSchema = z.object({
  name: z.string().min(2, "Machine name is required"),
  
  // .nullable() allows null
  // .optional() allows undefined
  // .or(z.literal('')) allows empty strings
  type: z.string().nullable().optional().or(z.literal('')),
  modelNumber: z.string().nullable().optional().or(z.literal('')),
  installDate: z.string().nullable().optional().or(z.literal('')),
  
  // We allow a long string for specs, which we will save as JSON later
  specifications: z.string().nullable().optional().or(z.literal('')),
});

export const submissionSchema = z.object({
  machineId: z.string().min(1, "Please select a machine"),
  submissionType: z.enum(["FILE_UPLOAD", "MANUAL_ENTRY"]),
  textInput: z.string().optional(),
  fileUrl: z.string().optional(),
}).refine((data) => {
  if (data.submissionType === "MANUAL_ENTRY") return !!data.textInput;
  if (data.submissionType === "FILE_UPLOAD") return !!data.fileUrl;
  return false;
}, {
  message: "Either text input or file is required",
});