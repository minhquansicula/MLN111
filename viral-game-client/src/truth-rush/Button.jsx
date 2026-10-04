import React from "react";

export const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClass = "tr-btn";
  const variantClass = {
    primary: "tr-btn-primary",
    secondary: "tr-btn-secondary",
    ghost: "tr-btn-ghost",
  }[variant] || "tr-btn-primary";

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="tr-spinner"></span>}
      {children}
    </button>
  );
};
