"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      router.push("/profile?uploaded=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Upload CV</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload a PDF or DOCX file. Your CV will be parsed into a structured profile using AI.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="card">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-16 transition-colors ${
            isDragging
              ? "border-neutral-400 bg-neutral-100"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mb-3 text-4xl">📄</div>
          <div className="text-sm font-medium text-neutral-700">
            {selectedFile ? selectedFile.name : "Drop your CV here, or click to browse"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">Supports PDF and DOCX</div>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-neutral-900">{selectedFile.name}</div>
              <div className="text-xs text-neutral-500">
                {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type || "Unknown type"}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-neutral-400 hover:text-neutral-700"
            >
              Remove
            </button>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => selectedFile && handleUpload(selectedFile)}
            disabled={!selectedFile || isUploading}
            className="btn-primary"
          >
            {isUploading ? (
              <>
                <Spinner size="sm" />
                Parsing CV...
              </>
            ) : (
              "Parse CV"
            )}
          </button>
          {isUploading && (
            <span className="text-xs text-neutral-500">
              Extracting text and running AI parser — this may take 20–40 seconds.
            </span>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 p-5">
        <h3 className="mb-2 text-sm font-semibold text-neutral-700">What happens next</h3>
        <ul className="space-y-1.5 text-sm text-neutral-500">
          <li>→ Text is extracted from your file on the server</li>
          <li>→ An AI model parses the content into structured JSON</li>
          <li>→ You can review and edit the result on the Profile screen</li>
          <li>→ Your API key is never exposed — all AI calls are server-side</li>
        </ul>
      </div>

      {/* Seed data option */}
      <div className="mt-4 text-center text-sm text-neutral-500">
        No CV handy?{" "}
        <a href="/profile" className="font-medium text-neutral-700 underline">
          Use the seeded profile
        </a>{" "}
        to explore the app.
      </div>
    </div>
  );
}
