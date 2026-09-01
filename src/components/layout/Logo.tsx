"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Brand logo. Light theme only — always renders the light-mode asset.
 */
export const Logo = ({
  className,
  width = 150,
  height = 40,
  priority = false
}: LogoProps) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Image
        src="/logos/itzdone-logo-lightMode.svg"
        alt="ITZ-DONE TECH"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
};
