import { COLORS } from "@/constants";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 cursor-pointer";

  const variants = {
    primary: "text-black",
    secondary: "bg-[#1A1A24] text-white border border-[#2A2A35] hover:border-[#3A3A48]",
    outline: "border border-[#fab6f5] text-[#fab6f5] hover:bg-[#fab6f5]/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        background:
          variant === "primary"
            ? "#fab6f5"
            : variant === "secondary"
            ? COLORS.background.card
            : undefined,
        borderColor:
          variant === "secondary"
            ? COLORS.border.default
            : variant === "outline"
            ? COLORS.lifi.pink
            : undefined,
        color: variant === "outline" ? "#fab6f5" : undefined,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
