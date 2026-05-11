"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const Logo = ({ 
  className, 
  width = 150, 
  height = 40, 
  priority = false 
}: LogoProps) => {
  const { theme } = useTheme();

  // Determine which logo to use based on the theme
  const logoSrc = theme === "dark" 
    ? "/logos/itzdone-logo-darkMode.svg" 
    : "/logos/itzdone-logo-lightMode.svg";

  return (
    <div className={cn("relative flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="ITZ-DONE TECH"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
};
