import { createContext, useState, useContext, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";


interface AuthContextType {
    user: any;
    signInWithGoogle: () => any;
    signInWithGithub: () => any;
    signInWithDiscord: () => any;
    signInAnonymously: () => void;
    linkAccount: (provider: 'google' | 'github' | 'discord') => any;
    connectGoogleCalendar: () => Promise<void>;
    hasGoogleLinked: boolean;
    signOut: () => any;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    signInWithGoogle: () => { },
    signInWithGithub: () => { },
    signInWithDiscord: () => { },
    signInAnonymously: () => { },
    linkAccount: () => { },
    connectGoogleCalendar: async () => { },
    hasGoogleLinked: false,
    signOut: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [hasGoogleLinked, setHasGoogleLinked] = useState(false);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: {
                        prompt: 'select_account',
                    }
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

    const signInAnonymously = async () => {
        try {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;

            if (!localStorage.getItem('anon_name')) {
                localStorage.setItem('anon_name', 'Anónimo');
            }

            if (params.get("redirect")) {
                const redirect = params.get("redirect");
                navigate(redirect ? decodeURIComponent(redirect) : "/", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error(error);
        }
    }

    const linkAccount = async (provider: 'google' | 'github' | 'discord') => {
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
                }
            })
            if (error) throw error
            return data;
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Connect Google Calendar for any user type:
     * - Google users: re-authenticate with calendar scope
     * - Discord/anon users: link Google identity with calendar scope
     * We request offline access so Supabase saves the provider_refresh_token
     * which our Edge Function will then use.
     */
    const connectGoogleCalendar = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const provider = session?.user?.app_metadata?.provider;
        const identities = session?.user?.identities ?? [];
        const hasGoogle = identities.some((i: any) => i.provider === 'google');

        const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
        const REDIRECT = `${window.location.origin}/calendar`;

        if (hasGoogle) {
            // Re-authenticate to get calendar scope (Google gives refresh_token if 'consent' is prompted)
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: REDIRECT,
                    scopes: CALENDAR_SCOPE,
                    queryParams: { prompt: 'consent', access_type: 'offline' },
                },
            });
        } else {
            // Link Google to the existing (Discord/anon) account
            await supabase.auth.linkIdentity({
                provider: 'google',
                options: {
                    redirectTo: REDIRECT,
                    scopes: CALENDAR_SCOPE,
                    queryParams: { prompt: 'consent', access_type: 'offline' },
                },
            });
        }
    };

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
        // Interceptar errores de OAuth o Vinculación desde la URL
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        const queryParams = new URLSearchParams(window.location.search);
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

        if (errorCode) {
            if (errorCode === 'identity_already_exists') {
                toast.error("Esta cuenta ya está registrada", {
                    description: "La cuenta de Google/Github intentada ya pertenece a otro usuario registrado. Por favor, inicia sesión normalmente con ella."
                });
            } else {
                const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');
                toast.error("Error de autenticación", {
                    description: errorDesc?.replace(/\+/g, ' ') || "No se pudo vincular la cuenta."
                });
            }
            // Limpiar la URL para evitar mostrar el error en recargas
            window.history.replaceState(null, '', window.location.pathname);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session == null) {
                navigate("/login", { replace: true });
            } else {
                const isAnon = session.user.is_anonymous;
                const anonName = localStorage.getItem('anon_name') || 'Anónimo';

                // Track whether this session has a Google identity linked
                const identities = session.user.identities ?? [];
                setHasGoogleLinked(identities.some((i: any) => i.provider === 'google'));

                // FIXED: Guardo el refresh token en user_metadata porque Supabase Auth a veces no actualiza identity_data
                // al reconectar una cuenta ya existente.
                if (session.provider_refresh_token && session.provider_refresh_token !== session.user.user_metadata?.provider_refresh_token) {
                    supabase.auth.updateUser({
                        data: { provider_refresh_token: session.provider_refresh_token }
                    });
                }

                setUser((prev: any) => {
                    if (prev?.id === session.user.id && prev?.isAnonymous === isAnon) {
                        return prev;
                    }
                    return {
                        ...session.user.user_metadata,
                        id: session.user.id,
                        email: isAnon ? '' : session.user.email,
                        isAnonymous: isAnon,
                        name: isAnon ? anonName : (session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Usuario"),
                        avatar_url: session.user.user_metadata?.avatar_url || "",
                        provider_token: session.provider_token ?? null,
                    };
                });

                if (params.get("redirect")) {
                    const redirect = params.get("redirect");
                    navigate(redirect ? decodeURIComponent(redirect) : "/", { replace: true });
                }
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate, params]);



    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, signInWithGithub, signInWithDiscord, signInAnonymously, linkAccount, connectGoogleCalendar, hasGoogleLinked, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}
