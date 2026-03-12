"use client";

import React from "react";
import ComingSoon from "@/components/layout/ComingSoon";
import { Briefcase } from "lucide-react";

export default function BusinessPage() {
  return (
    <ComingSoon 
      title="For Business" 
      description="Empower your team with our enterprise learning solutions. Custom paths, progress tracking, and group licensing coming soon."
      Icon={Briefcase}
    />
  );
}
