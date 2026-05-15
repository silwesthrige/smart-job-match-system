import { motion } from "motion/react";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" } : {}}
      className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
