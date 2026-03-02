import { createContext, useState, useContext, useEffect } from "react";
import supabase from "../config/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";


interface AuthContextType {
    user: any;
    iniciarSesionConGoogle: () => any;
    iniciarSesionConGithub: () => any;
    iniciarSesionConDiscord: () => any;
    cerrarSesion: () => any;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    iniciarSesionConGoogle: () => { },
    iniciarSesionConGithub: () => { },
    iniciarSesionConDiscord: () => { },
    cerrarSesion: () => { },
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const iniciarSesionConGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            })
            if (error) throw error
            return data;
        } catch (error) {
            console.log(error)
        }
    }

    const iniciarSesionConGithub = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            })
            if (error) throw error
            return data;
        } catch (error) {
            console.log(error)
        }
    }

    const iniciarSesionConDiscord = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
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
            // console.log("supabase session", event)
            if (session == null) {
                navigate("/login", { replace: true });
            }
            else {
                setUser({
                    ...session?.user.user_metadata,
                    id: session?.user.id,
                    email: session?.user.email,
                });
                console.log("user", session.user)

                if (params.get("redirect")) {
                    const redirect = params.get("redirect");
                    navigate(redirect ? decodeURIComponent(redirect) : "/home", { replace: true });
                }
                // navigate("/", { replace: true }) //Esto nos esta haciendo quilombo, proba alt tabear, te
            }                                       // redirije siempre al home pq chequea todo el tiempo que esta logeado.
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);



    return (
        <AuthContext.Provider value={{ user, iniciarSesionConGoogle, iniciarSesionConGithub, iniciarSesionConDiscord, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
