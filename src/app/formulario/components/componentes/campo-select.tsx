import React from "react";

type Opcoes = {
  value: string;
  label: string
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Opcoes[];
  placeholder?: string;
  containerClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
  name?: string;
};

export function SelectCampo({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  containerClassName = "mx-2 mt-2 md:mx-0 md:mt-0",
  selectClassName = "w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base",
  disabled = false,
  name,
}: SelectProps) {
  return (
    <div className={containerClassName}> 
      <label className="text-sm sm:text-base font-medium"> {label} </label>

      <select 
        name={name}
        value={value}
        disabled={disabled}
        onChange={ (e) => onChange(e.target.value)}
        className={selectClassName} 
      >
        <option
          value=""
          disabled
        > {placeholder} </option>

        {options.map( (opt) => (
          <option key={opt.value} value={opt.value}> {opt.label} </option>
        ))}

      </select>
    </div>
  )
}