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

export function Menu() {

  const [menu, setMenu] = useState(false);

  const router = useRouter();

  function abrirMenu() {
    
    setMenu(!menu)

  }

  function paginaClientes(){
    router.push("/clientes");
  }


  return(
    <div>

      <div className={`transition-all duration-200 whitespace-nowrap bg-[#002956] h-screen ${menu ? 'w-80' : 'w-20'}`} >

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
          <BsFillPeopleFill size={34} color="#fff" className="cursor-pointer"  />
          <span
            onClick={paginaClientes}
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Clientes
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <GrUserManager  size={34} color="#fff" className="cursor-pointer"  />
          <span
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Consultores
          </span>
        </div>

        <div className="flex items-center text-white gap-2 px-4 mt-6">
          <GrMoney size={34} color="#fff" className="cursor-pointer"  />
          <span
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
          <RiLogoutBoxLine size={34} color="#fff" className="cursor-pointer"  />
          <span
            className={`transition-all duration-300 text-lg cursor-pointer ${
              menu ? 'opacity-100 scale-100' : 'hidden'
            }`}
          > Sair
          </span>
        </div>



        <div>

        </div>

      </div>

    </div>
  )
}