export default function Obrigado() {
  return(
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom,_rgba(0,41,86,1)_0%,_rgba(38,55,171,1)_50%,_rgba(12,12,92,1)_100%)] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Obrigado pelo seu contato!</h1>
        <p className="text-gray-700 text-lg mb-6">
          Recebemos suas informações com sucesso.<br />
          Um dos nossos consultores entrará em contato com você em breve.
        </p>
        <p className="text-sm text-gray-500">Fique atento ao seu e-mail e telefone.</p>
      </div>
    </div>
  )
}