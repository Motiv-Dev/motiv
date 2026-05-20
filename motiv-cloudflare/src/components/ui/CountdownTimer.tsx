"use client";

import { useState, useEffect, memo } from "react";
import { formatCurrency } from "@/lib/utils";

interface CountdownProps {
  deadline: string;
  dailyAmount: number;
  onExpire?: () => void;
}

function CountdownTimer({ deadline, dailyAmount, onExpire }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const end = new Date(deadline);
      end.setHours(23, 59, 59, 999);

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        onExpire?.();
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      });
    }

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const totalHours = timeLeft.total / (1000 * 60 * 60);
  const isUrgent = totalHours <= 2;
  const isCritical = totalHours <= 1;

  return (
    <div className={`rounded-2xl p-4 transition-all ${
      isCritical ? "bg-red-50 border border-red-200" :
      isUrgent ? "bg-amber-50 border border-amber-200" :
      "bg-stone-50 border border-stone-100"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Deadline</span>
        <span className={`text-xs font-bold ${isCritical ? "text-red-500" : isUrgent ? "text-amber-500" : "text-stone-500"}`}>
          {formatCurrency(dailyAmount)} at risk
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {[
          { val: timeLeft.hours, label: "h" },
          { val: timeLeft.minutes, label: "m" },
          { val: timeLeft.seconds, label: "s" },
        ].map((unit, i) => (
          <div key={i} className="flex items-baseline gap-0.5">
            {i > 0 && <span className={`text-xl font-bold ${isCritical ? "text-red-300" : "text-stone-300"} ${isCritical ? "animate-pulse" : ""}`}>:</span>}
            <span className={`text-3xl font-black tabular-nums tracking-tight ${
              isCritical ? "text-red-500" : isUrgent ? "text-amber-500" : "text-stone-900"
            }`}>
              {String(unit.val).padStart(2, "0")}
            </span>
            <span className="text-xs text-stone-400 font-semibold">{unit.label}</span>
          </div>
        ))}
      </div>
      {isCritical && (
        <p className="mt-2 text-xs text-red-500 font-bold animate-pulse">
          Submit now or lose {formatCurrency(dailyAmount)}
        </p>
      )}
    </div>
  );
}

export default memo(CountdownTimer);
