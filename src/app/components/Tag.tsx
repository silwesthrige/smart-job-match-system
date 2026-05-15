interface TagProps {
  text: string;
  variant?: "default" | "success" | "warning" | "info";
  icon?: React.ReactNode;
}

export function Tag({ text, variant = "default", icon }: TagProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${variants[variant]}`}>
      {icon}
      {text}
    </span>
  );
}
