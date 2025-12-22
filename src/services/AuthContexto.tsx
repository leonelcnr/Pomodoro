import { createContext, useState, useContext, useEffect } from "react";
import supabase from "../config/supabase";
import { replace, useNavigate } from "react-router-dom";


const AuthContext = createContext({
    user: null,
    iniciarSesionConGoogle: () => { },
    cerrarSesion: () => { }
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

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
            setUser(null) // no se si hace falta esto
            if (error) throw error
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("supabase session", event)
            if (session == null) {
                navigate("/login", { replace: true });
            }
            else {
                setUser(session?.user.user_metadata);
                console.log("user", session.user)
                navigate("/", { replace: true })
            }
        });
        return () => {
            authListener.subscription;
        };
    }, []);



    return (
        <AuthContext.Provider value={{ user, iniciarSesionConGoogle, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
