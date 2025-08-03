'use client';

import Head from 'next/head';
import Image from 'next/image';
import logo from '@/fotos/logo.png';

export default function Contatos() {
  return (
    <>
      <Head>
        <title>Lang Consultoria</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002b56] to-[#0077b6] p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 text-center border border-gray-200">

          <h1 className='text-3xl font-extrabold mb-6 mt-4'> <span className='text-[#023656]'>LA</span><span className='text-[#1CA3C8]'>NG</span> CONSULTORIA </h1>

          <p className="text-gray-600 mb-6">
            Na Lang Consultoria, você consegue empréstimos com aprovação ágil, sem burocracia e com condições transparentes.
            Realize seus planos de forma prática e confiável.
          </p>

          <div className="flex flex-col gap-4">
            <a
              href="https://wa.me/5569992815365?text=Olá%2C+tenho+interesse+em+saber+mais+sobre+as+opções+de+empréstimo."
              target="_blank"
              className="bg-[#0077b6] hover:bg-[#005b96] text-white py-3 rounded-lg font-semibold transition duration-300"
            >
              💬 Falar com Consultor Arthur
            </a>
            <a
              href="https://wa.me/5569992510425?text=Olá%2C+tenho+interesse+em+saber+mais+sobre+as+opções+de+empréstimo."
              target="_blank"
              className="bg-[#0077b6] hover:bg-[#005b96] text-white py-3 rounded-lg font-semibold transition duration-300"
            >
              💬 Falar com Consultor João
            </a>
            <a
              href="https://wa.me/5569993769115?text=Olá%2C+tenho+interesse+em+saber+mais+sobre+as+opções+de+empréstimo."
              target="_blank"
              className="bg-[#0077b6] hover:bg-[#005b96] text-white py-3 rounded-lg font-semibold transition duration-300"
            >
              💬 Falar com Consultora Dominique
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            &copy; 2025 Lang Consultoria. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </>
  );
}
