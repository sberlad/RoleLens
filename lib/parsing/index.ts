/**
 * File parsing entry point.
 * Detects file type and extracts text accordingly.
 */

import { extractTextFromPDF } from "./pdf";
import { extractTextFromDOCX } from "./docx";

export type SupportedFileType = "pdf" | "docx";

export function detectFileType(filename: string, mimeType?: string): SupportedFileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (
    ext === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  throw new Error(`Unsupported file type: ${ext ?? mimeType}. Only PDF and DOCX are supported.`);
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
): Promise<string> {
  const fileType = detectFileType(filename, mimeType);
  switch (fileType) {
    case "pdf":
      return extractTextFromPDF(buffer);
    case "docx":
      return extractTextFromDOCX(buffer);
  }
}
