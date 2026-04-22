"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogsPage() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, [router]);

  // This component never renders anything
  return null;
}