"use client";

import React from "react";
import ComingSoon from "@/components/layout/ComingSoon";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <ComingSoon 
      title="Cart" 
      description="Your learning journey starts here. Our checkout experience is being refined to be as smooth as possible."
      Icon={ShoppingCart}
    />
  );
}
