"use client";

import React from "react";
import ComingSoon from "@/components/layout/ComingSoon";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ComingSoon 
      title="Profile" 
      description="Your personalized learning profile is under construction. Soon you'll be able to track your certificates, achievements, and statistics here."
      Icon={User}
    />
  );
}
