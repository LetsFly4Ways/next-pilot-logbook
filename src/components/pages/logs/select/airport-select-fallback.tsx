"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readSelectContext } from "@/components/pages/logs/select/select-context";
import CenterSpinner from "@/components/ui/center-spinner";

interface AirportSelectFallbackProps {
  type: "flight" | "simulator";
}

export default function AirportSelectFallback({ type }: AirportSelectFallbackProps) {
  const router = useRouter();

  useEffect(() => {
    // Airport selection is only available for flights, redirect to where user came from
    const context = readSelectContext(type);
    const returnHref = context?.return ?? "/app/logs/simulator/new";
    router.push(returnHref);
  }, [type, router]);

  // Show spinner while redirecting
  return <CenterSpinner />;
}
