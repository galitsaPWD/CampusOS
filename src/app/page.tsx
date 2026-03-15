"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // PRD Goal: Landing page will be here, but for now redirect to desktop
    router.replace("/desktop");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bios-text text-sm">INITIALISING SYSTEM...</div>
    </div>
  );
}
