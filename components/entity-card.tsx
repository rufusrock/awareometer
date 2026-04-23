import type { Entity } from "@/lib/types";

type EntityCardProps = {
  entity: Entity;
  isSelected?: boolean;
  isDimmed?: boolean;
  percentage?: number | null;
  onClick: () => void;
};

export function EntityCard({ entity, isSelected = false, isDimmed = false, percentage = null, onClick }: EntityCardProps) {
  const showPercentage = percentage !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSelected || isDimmed}
      className={`group glass-panel relative flex w-full flex-col overflow-hidden rounded-[1.75rem] text-left shadow-card transition duration-200 focus:outline-none focus:ring-4 focus:ring-slate-300 ${
        isSelected ? "scale-[0.99]" : "hover:-translate-y-1 hover:shadow-2xl"
      } ${isDimmed ? "opacity-70" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={entity.image_url}
          alt={entity.image_alt}
          className={`h-full w-full object-cover transition duration-500 ${isSelected ? "scale-[1.02]" : "group-hover:scale-[1.03]"}`}
          loading="eager"
          decoding="async"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-200 ${
            showPercentage
              ? `opacity-100 ${isSelected ? "bg-slate-950/80" : "bg-slate-950/60"}`
              : "pointer-events-none opacity-0"
          }`}
        >
          {showPercentage && (
            <div className="percentage-reveal flex flex-col items-center gap-1">
              <span className={`text-5xl font-black tabular-nums sm:text-6xl ${isSelected ? "text-white" : "text-white/90"}`}>
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{entity.label}</h2>
      </div>
    </button>
  );
}
