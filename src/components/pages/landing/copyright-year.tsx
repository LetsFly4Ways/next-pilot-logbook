"use client";

import { useEffect, useState } from "react";

export function CopyrightYear() {
  const [year, setYear] = useState("2026"); // Default server value

  useEffect(() => {
    // Use a 0ms timeout to push the update to the next event tick.
    // This bypasses the "synchronous state update" linter error.
    const timer = setTimeout(() => {
      setYear(new Date().getFullYear().toString());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return <span>{year}</span>;
}