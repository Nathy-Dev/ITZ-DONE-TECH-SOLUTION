"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Award, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";

interface CertificateButtonProps {
  courseId: Id<"courses">;
  userId: Id<"users"> | null;
  studentName: string;
  courseTitle: string;
  progress: number;
}

export default function CertificateButton({ 
  courseId, 
  userId,
  studentName, 
  courseTitle, 
  progress 
}: CertificateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const existingCertificate = useQuery(api.certificates.getCertificateByCourse, 
    userId ? { courseId, userId } : "skip"
  );
  const issueCertificate = useMutation(api.certificates.issueCertificate);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // 1. Logic to issue certificate in backend if it doesn't exist
      if (!existingCertificate) {
        const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        await issueCertificate({ courseId, userId: userId!, certificateId: certId });
      }

      // 2. Generate PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Simple premium certificate design using jsPDF directly for speed
      // Background
      doc.setFillColor(250, 250, 252);
      doc.rect(0, 0, 297, 210, "F");
      
      // Border
      doc.setDrawColor(30, 58, 138); // blue-900
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, 273, 186);

      // Header
      doc.setTextColor(30, 58, 138); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.text("CERTIFICATE OF COMPLETION", 148.5, 50, { align: "center" });

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text("THIS IS TO CERTIFY THAT", 148.5, 75, { align: "center" });

      // Student Name
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.text(studentName.toUpperCase(), 148.5, 95, { align: "center" });

      // Description
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text("HAS SUCCESSFULLY COMPLETED THE COURSE", 148.5, 115, { align: "center" });

      // Course Title
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(courseTitle, 148.5, 135, { align: "center" });

      // Footer
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(14);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, 60, 170, { align: "center" });
      doc.text("INSTRUCTOR: ITS-DONE TECH SOLUTIONS", 237, 170, { align: "center" });

      // Seal/Icon placeholder effect
      doc.setDrawColor(251, 191, 36); // amber-400
      doc.setLineWidth(1);
      doc.circle(148.5, 170, 15);
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(10);
      doc.text("CERTIFIED", 148.5, 171.5, { align: "center" });

      doc.save(`${courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`);
    } catch (error) {
      console.error("Certificate Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isCompleted = progress === 100;

  if (!isCompleted) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-slate-400 cursor-not-allowed">
        <Award className="w-5 h-5" />
        <span className="text-sm font-bold">Complete course to unlock certificate</span>
      </div>
    );
  }

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-800 to-indigo-900 text-white rounded-[24px] shadow-xl shadow-blue-800/20 hover:scale-[1.02] transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <div className="text-left">
          <h4 className="font-bold">Course Completed!</h4>
          <p className="text-xs text-white/70">Click to download your official certificate</p>
        </div>
      </div>
      
      {isGenerating ? (
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      ) : (
        <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
          <Download className="w-5 h-5" />
        </div>
      )}
    </button>
  );
}
