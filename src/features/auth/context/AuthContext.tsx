import { createContext, useState, useContext, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";


interface AuthContextType {
    user: any;
    signInWithGoogle: () => any;
    signInWithGithub: () => any;
    signInWithDiscord: () => any;
    signOut: () => any;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    signInWithGoogle: () => { },
    signInWithGithub: () => { },
    signInWithDiscord: () => { },
    signOut: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const signInWithGoogle = async () => {
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
            console.error(error)
        }
    }

    const signInWithGithub = async () => {
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
            console.error(error)
        }
    }

    const signInWithDiscord = async () => {
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
            console.error(error)
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            setUser(null)
            if (error) throw error
        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate, params]);



    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signInWithGithub, signInWithDiscord, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}
