import React from 'react';

interface Props {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function Input({ label, type = 'text', name, value, onChange, placeholder }: Props) {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
      />
    </div>
  );
}
