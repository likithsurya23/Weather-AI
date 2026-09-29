"use client";

import React from "react";
import { CloudShader } from "@/components/ui/cloud-shader";

export default function AppCloudBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full max-w-full h-screen max-h-screen supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]"
    >
      <CloudShader
        className="w-full h-full min-h-0"
        speed={0.8}
        count={6}
        cloudColor="#ffffff"
        skyTopColor="#3b82f6"
        skyBottomColor="#93c5fd"
      />
    </div>
  );
}
