interface Props {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function CampoInfo({ label, type = "text", name, value, onChange, placeholder }: Props) {
  return (
    <div className="mx-2 mt-4 md:mx-0 md:mt-0"> 
      <label> {label} </label>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
      />
    </div>
  )
}