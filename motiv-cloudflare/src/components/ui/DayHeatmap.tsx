"use client";

interface DayStatus {
  day: number;
  status: string;
}

interface DayHeatmapProps {
  totalDays: number;
  currentDay: number;
  dailyStatuses: DayStatus[];
}

export default function DayHeatmap({ totalDays, currentDay, dailyStatuses }: DayHeatmapProps) {
  const statusMap = new Map<number, string>();
  for (const ds of dailyStatuses) {
    statusMap.set(ds.day, ds.status);
  }

  function getColor(day: number): string {
    const status = statusMap.get(day);
    if (status === "approved") return "bg-emerald-500";
    if (status === "missed") return "bg-red-500";
    if (status === "rejected") return "bg-amber-500";
    if (status === "submitted" || status === "pending") return "bg-orange-400";
    if (day < currentDay) return "bg-red-500/40"; // past day with no proof = likely burned
    if (day === currentDay) return "bg-stone-300 ring-2 ring-orange-400 ring-offset-1";
    return "bg-stone-200"; // future
  }

  function getTooltip(day: number): string {
    const status = statusMap.get(day);
    if (status === "approved") return `Day ${day} — Verified`;
    if (status === "missed") return `Day ${day} — Burned`;
    if (status === "rejected") return `Day ${day} — Rejected (re-upload)`;
    if (status === "submitted") return `Day ${day} — Pending review`;
    if (day < currentDay) return `Day ${day} — Missed`;
    if (day === currentDay) return `Day ${day} — Today`;
    return `Day ${day} — Upcoming`;
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Daily Progress</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
          <div
            key={day}
            title={getTooltip(day)}
            className={`w-5 h-5 rounded-md transition-all ${getColor(day)} ${
              day <= currentDay ? "opacity-100" : "opacity-50"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[9px] text-stone-400 font-semibold">Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-[9px] text-stone-400 font-semibold">Burned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-[9px] text-stone-400 font-semibold">Rejected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-stone-200" />
          <span className="text-[9px] text-stone-400 font-semibold">Upcoming</span>
        </div>
      </div>
    </div>
  );
}
