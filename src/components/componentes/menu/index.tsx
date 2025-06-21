"use client"

import { FaBars } from "react-icons/fa6";
import Link from 'next/link';
import { useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { GrUserManager } from "react-icons/gr";
import { RiLogoutBoxLine } from "react-icons/ri";
import { CgNotes } from "react-icons/cg";
import { GrMoney } from "react-icons/gr";
import { RiDashboard3Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/client'
import { FaGear } from "react-icons/fa6";

export function Menu() {

  const [menu, setMenu] = useState(false);

  const router = useRouter();

  const [mostrarModal, setMostrarModal] = useState(false);

  function abrirMenu() {
    
    setMenu(!menu)

  }

  function paginaClientes(){
    setMostrarModal(false);
    router.push("/clientes");
  }

  function paginaConsultores() {
    setMostrarModal(false);
    router.push("/consultores");
  }

  function paginaLancamentos() {
    setMostrarModal(false);
    router.push("/lancamentos");
  }

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return(
    <div className="">

      <div className={`transition-all duration-200 whitespace-nowrap bg-[#002956] py-4 sm:hidden`}>
        <div className='flex items-center justify-between gap-2 px-4'>

          <Link href="/"> 
              <h1 className='transition-all duration-300 text-2xl text-center font-bold text-white'> <span className='text-[#1BA1C8]'>LANG</span> CONSULTORIA </h1>
          </Link>

          <button onClick={ () => setMostrarModal(true)} className='cursor-pointer'> {menu ? <IoMdClose size={24} color="#fff"/> : <FaBars size={24} color="fff" />
          } </button>

        </div>

      </div>

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">

            <div className="flex items-center text-black gap-2 px-4 mt-8">
              <BsFillPeopleFill onClick={paginaClientes} size={34} color="#111" className="cursor-pointer" />
              <span
                onClick={paginaClientes}
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Clientes
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <GrUserManager onClick={paginaConsultores} size={34} color="#111" className="cursor-pointer"  />
              <span
                onClick={paginaConsultores}
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Consultores
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <GrMoney onClick={paginaLancamentos} size={34} color="#111" className="cursor-pointer"  />
              <span
                onClick={paginaLancamentos}
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Lançamentos
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <CgNotes size={34} color="#111" className="cursor-pointer"  />
              <span
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Notas Promissórias
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <RiDashboard3Line  size={34} color="#111" className="cursor-pointer"  />
              <span
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Relatórios
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <FaGear size={34} color="#111" className="cursor-pointer"  />
              <span
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Configurações
              </span>
            </div>

            <div className="flex items-center text-black gap-2 px-4 mt-6">
              <RiLogoutBoxLine onClick={sair} size={34} color="#111" className="cursor-pointer"  />
              <span
                onClick={sair}
                className={`transition-all duration-300 text-lg cursor-pointer ${
                  mostrarModal ? 'opacity-100 scale-100' : 'hidden'
                }`}
              > Sair
              </span>
            </div>

            <button onClick={ () => setMostrarModal(false)} className='cursor-pointer mt-4'> {menu ? <FaBars size={24} color="#111"/> : <IoMdClose size={36} color="111" /> } </button>

          </div>

        </div>

      )}

      {/* =========================================================== */}

      <div className={`hidden sm:block transition-all duration-200 whitespace-nowrap bg-[#002956] h-full ${menu ? 'w-80' : 'w-20'}`} >

        <div className='flex items-center justify-between gap-2 px-4 pt-4'>

          {menu && (
            <Link href="/"> 
              <h1 className='transition-all duration-300 text-2xl text-center font-bold text-white'> <span className='text-[#1BA1C8]'>LANG</span> CONSULTORIA </h1>
          </Link>
          )}

          <button onClick={abrirMenu} className='cursor-pointer'> {menu ? <IoMdClose size={24} color="#fff"/> : <FaBars size={24} color="fff" />
          } </button>

        </div>

        <div className='w-70 h-0.5 bg-white m-auto mt-4'> </div>

        <div className="flex items-center text-white gap-2 px-4 mt-8">
          <BsFillPeopleFill onClick={paginaClientes} size={34} color="#fff" className="cursor-pointer"  />
          <span
            onClick={paginaClientes}
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Clientes
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <GrUserManager onClick={paginaConsultores} size={34} color="#fff" className="cursor-pointer"  />
          <span
            onClick={paginaConsultores}
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Consultores
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <GrMoney onClick={paginaLancamentos} size={34} color="#fff" className="cursor-pointer"  />
          <span
            onClick={paginaLancamentos}
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Lançamentos
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <CgNotes size={34} color="#fff" className="cursor-pointer"  />
          <span
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Notas Promissórias
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <RiDashboard3Line  size={34} color="#fff" className="cursor-pointer"  />
          <span
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Relatórios
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <FaGear size={32} color="#fff" className="cursor-pointer"  />
          <span
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Configurações
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <RiLogoutBoxLine onClick={sair} size={34} color="#fff" className="cursor-pointer"  />
          <span
            onClick={sair}
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Sair
          </span>
        </div>

      </div>

    </div>
    
  )
}