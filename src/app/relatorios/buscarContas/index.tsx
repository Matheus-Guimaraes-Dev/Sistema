export function BuscarContas() {
  return(
    <div className="p-6 bg-gray-100 min-h-screen flex-1">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Relatório Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor Emprestado</h2>
          <p className="text-2xl font-bold text-red-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor a Receber</h2>
          <p className="text-2xl font-bold text-gray-700 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor Pago</h2>
          <p className="text-2xl font-bold text-green-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Total Líquido</h2>
          <p className="text-2xl font-bold text-gray-800 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Total Comissão a Pagar</h2>
          <p className="text-2xl font-bold text-purple-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Comissão Paga</h2>
          <p className="text-2xl font-bold text-amber-600 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-700">Total Líquido Final</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">R$ 0,00</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-700">Valor em Caixa</h2>
          <p className="text-3xl font-bold text-emerald-700 mt-2">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}