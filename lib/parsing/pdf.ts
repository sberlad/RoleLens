/**
 * PDF text extraction using pdf-parse.
 * Runs server-side only.
 */

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to ensure this only runs server-side
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text.trim();
}
