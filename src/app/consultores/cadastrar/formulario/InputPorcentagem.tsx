import React from 'react';

interface InputPorcentagemProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
}

export default function InputPorcentagem({
  label,
  value,
  onChange,
  name,
  required = false,
}: InputPorcentagemProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    val = val.replace(/[^0-9.]/g, '');

    const partes = val.split('.');
    if (partes.length > 2) {
      val = partes[0] + '.' + partes[1];
    }

    const numero = parseFloat(val);

    if (isNaN(numero)) {
      onChange('');
    } else if (numero >= 0 && numero <= 100) {
      onChange(val);
    } else if (numero > 100) {
      onChange('100');
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          className="w-full h-8 border-2 mt-1 px-1 border-[#002956] rounded focus:outline-[#4b8ed6]"
        />
      </div>
    </div>
  );
}
