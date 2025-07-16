"use client";
import { createContext, useContext, useState, useEffect } from "react";

type GrupoUsuario = "Administrador" | "Proprietario" | "Gerente" | "Consultor";

interface UserContextType {
  grupo: GrupoUsuario | null;
  setGrupo: (grupo: GrupoUsuario | null) => void;
  id: string | null; 
  setId: (id: string | null) => void; 
  carregando: boolean;
}

const UserContext = createContext<UserContextType>({
  grupo: null,
  setGrupo: () => {},
  id: null,
  setId: () => {},
  carregando: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [grupo, setGrupo] = useState<GrupoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    async function buscarGrupo() {
      const supabase = (await import("@/lib/client")).createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setGrupo(null);
        setId(null);
        setCarregando(false);
        return;
      }

      setId(user.id);

      const { data, error: erroGrupo } = await supabase
        .from("usuarios")
        .select("grupo")
        .eq("id", user.id)
        .single();

      if (erroGrupo || !data) {
        setGrupo(null);
      } else {
        setGrupo(data.grupo as GrupoUsuario);
      }

      setCarregando(false);
    }

    buscarGrupo();
  }, []);

  return (
    <UserContext.Provider value={{ grupo, setGrupo, id, setId, carregando }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
