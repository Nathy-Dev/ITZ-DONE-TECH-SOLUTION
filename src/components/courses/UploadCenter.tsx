"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  Upload, 
  FileText, 
  Video, 
  Image as ImageIcon,
  Loader2,
  Trash2,
  Copy,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadCenterProps {
  courseId: Id<"courses">;
}

export default function UploadCenter({ courseId }: UploadCenterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const media = useQuery(api.files.listMedia, { courseId });
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveMedia = useMutation(api.files.saveMedia);
  const deleteMedia = useMutation(api.files.deleteMedia);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // 1. Get upload URL from Convex
      const postUrl = await generateUploadUrl();
      setUploadProgress(40);

      // 2. Upload file to URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      setUploadProgress(80);

      // 3. Save media reference in Database
      await saveMedia({
        courseId,
        storageId,
        name: file.name,
        type: file.type.split('/')[0] || "document",
        size: file.size,
        url: "", // We rely on resolvedUrl from the query
      });

      setUploadProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const copyToClipboard = async (url: string | null, id: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-800 dark:text-cyan-400" />
        Content Upload Center
      </h3>

      {/* Upload Dropzone */}
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "w-full p-8 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden",
          isUploading 
            ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 pointer-events-none" 
            : "border-slate-200 dark:border-slate-700 hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept="video/*,image/*,application/pdf"
        />
        
        {isUploading ? (
          <div className="space-y-4 z-10">
            <Loader2 className="w-8 h-8 text-blue-800 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Uploading file...</p>
              <div className="w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-800 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 z-10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold">Click to upload media</p>
            <p className="text-xs text-muted-foreground font-medium">Supports Video, Images, and PDFs</p>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      <div className="mt-8 space-y-4">
        {media === undefined ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <p className="text-sm text-center text-slate-400 font-medium py-4">No files uploaded yet.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {media.map((item) => (
              <div 
                key={item._id} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {item.type} • {formatFileSize(item.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  <button 
                    onClick={() => copyToClipboard(item.resolvedUrl, item._id)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                    title="Copy Link"
                  >
                    {copiedId === item._id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => deleteMedia({ id: item._id, storageId: item.storageId })}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
