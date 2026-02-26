// src/components/Select.tsx
import React, { ChangeEvent } from "react";

interface Option {
  label: string;
  value: string | undefined;
}

interface SelectProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectOpcoes({ label, name, value, onChange, options, placeholder = "", disabled = false, className = "" }: SelectProps) {
  return (
    <div className="mx-2 md:mx-0">
      <label className="text-sm sm:text-base font-medium"> {label} </label>
      <select
        name={name}
        className={`w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base ${className}`}
        value={value}
        onChange={onChange}
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
