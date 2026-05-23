import { motion } from "motion/react";

interface ProgressBarProps {
  percentage: number;
  color?: string;
  label?: string;
}

export function ProgressBar({ percentage, color = "#4F46E5", label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-2 text-sm text-gray-600">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
