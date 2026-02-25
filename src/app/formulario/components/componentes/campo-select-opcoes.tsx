// src/components/Select.tsx
import React from "react";

interface Option {
  label: string;
  value: string | undefined;
}

interface SelectProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectOpcoes({ label, value, onChange, options, placeholder = "", disabled = false, className = "" }: SelectProps) {
  return (
    <div>
      <label className="text-sm sm:text-base font-medium"> {label} </label>
      <select
        className={`w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
    </div>
  );
}
