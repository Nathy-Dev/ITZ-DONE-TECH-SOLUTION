"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, AlertCircle } from "lucide-react";

export type UploadKind = "video" | "document" | "image" | "avatar";

interface MediaUploadProps {
  kind: UploadKind;
  courseId?: string;
  lessonId?: string;
  accept: string;
  label: string;
  onReady: (media: { mediaId: string; objectKey?: string; url?: string }) => void;
}

export default function MediaUpload({ kind, courseId, lessonId, accept, label, onReady }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const upload = async (file: File) => {
    setState("uploading"); setProgress(5); setMessage("");
    try {
      const init = await fetch(kind === "video" ? "/api/media/video/upload-initiate" : "/api/media/file/upload-initiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, courseId, lessonId, name: file.name, mimeType: file.type, sizeBytes: file.size }) });
      const data = await init.json().catch(() => ({}));
      if (!init.ok || !data.uploadUrl) throw new Error(data.error || "Could not initialize upload");
      setProgress(20);
      const uploaded = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploaded.ok) throw new Error("Upload failed. Please try again.");
      setProgress(85);
      if (kind !== "video") {
        const complete = await fetch("/api/media/file/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaId: data.mediaId, objectKey: data.objectKey }) });
        const result = await complete.json().catch(() => ({}));
        if (!complete.ok) throw new Error(result.error || "Could not verify upload");
        onReady({ mediaId: data.mediaId, objectKey: data.objectKey });
      } else {
        onReady({ mediaId: data.mediaId });
      }
      setProgress(100); setState("complete");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return <div className="space-y-2"><input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} /><button type="button" onClick={() => inputRef.current?.click()} disabled={state === "uploading"} className="w-full p-3 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">{state === "uploading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {progress}%</> : state === "complete" ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Uploaded successfully</> : <><Upload className="w-4 h-4" /> {label}</>}</button>{state === "error" && <p className="flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className="w-3.5 h-3.5" />{message}</p>}{kind === "video" && <p className="text-[10px] text-slate-400">Videos are streamed privately and are not provided as downloads. Processing may take a few minutes.</p>}</div>;
}
