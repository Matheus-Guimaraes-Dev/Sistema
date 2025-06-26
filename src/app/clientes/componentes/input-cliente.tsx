import React from 'react';

interface Props {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  inputMode?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
}

export function InputCliente({ label, type = 'text', name, value, onChange, placeholder, onBlur, inputMode, maxLength }: Props) {
  return (
    <div className="">
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={onBlur}
        className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base px-1 mt-[-4px]"
      />
    </div>
  );
}
