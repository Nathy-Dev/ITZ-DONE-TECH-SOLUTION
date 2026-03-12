"use client";

import React from "react";
import ComingSoon from "@/components/layout/ComingSoon";
import { Users } from "lucide-react";

export default function MentorshipPage() {
  return (
    <ComingSoon 
      title="Mentorship" 
      description="We're building a world-class mentorship program to connect you with industry experts for 1-on-1 guidance."
      Icon={Users}
    />
  );
}
