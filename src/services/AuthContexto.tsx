import { createContext, useState, useContext } from "react";
import supabase from "../config/supabase";

const AuthContext = createContext({
    user: null,
    setUser: (user: any) => { },
    iniciarSesionConGoogle: () => { },
    cerrarSesion: () => { }
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    const iniciarSesionConGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            })
            if (error) throw error
            return data;
        } catch (error) {
            console.log(error)
        }
    }

    const cerrarSesion = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null) // no se si hace falta esto
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, iniciarSesionConGoogle, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
