import React from 'react';

interface Props {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: string;
  pattern?: string;
  maxLength?: number;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aceept?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

export function InputAlterar({ label, type = 'text', name, value, onChange, placeholder, inputMode, pattern, maxLength, onBlur, aceept, readOnly, disabled }: Props) {
  return (
    <div className="">
      <label className="block font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={onBlur}
        readOnly={readOnly}  
        disabled={disabled}
        className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
      />
    </div>
  );
}
