"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

interface LiveTimeDisplayProps {
  timezone: string;
}

export function LiveTimeDisplay({ timezone }: LiveTimeDisplayProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{formatInTimeZone(time, timezone, "HH:mm")}</>;
}
