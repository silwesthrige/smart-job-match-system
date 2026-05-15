import { motion } from "motion/react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  as?: "button" | "span";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  type = "button",
  as = "button",
}: ButtonProps) {
  const baseStyles = "rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md hover:shadow-lg",
    secondary: "bg-[#06B6D4] text-white hover:bg-[#0891B2] shadow-md hover:shadow-lg",
    outline: "border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };
  
  const Component = motion[as];
  
  return (
    <Component
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      type={as === "button" ? type : undefined}
    >
      {children}
    </Component>
  );
}