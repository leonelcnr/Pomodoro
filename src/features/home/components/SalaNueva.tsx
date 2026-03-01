import React, { useState } from 'react';
import { Card } from "@/components/ui/card"; // Ajusta la ruta según tu estructura de Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsearInvitacion } from "@/features/home/parsearInvitacion"
import { useNavigate } from 'react-router-dom';
import supabase from "@/config/supabase"
import { toast } from "sonner"


export const SalaNueva = () => {
    // CREAR SALA NUEVA
    const navigate = useNavigate();
    const crearSala = async () => {
        const { data, error } = await supabase.rpc("create_room", {
            p_name: "Sala de estudio",
            p_is_public: false,
            p_max_uses: null,
            p_expires_minutes: null,
        });
        if (error) return;

        const { room_id } = data[0];
        console.log(room_id);
        navigate(`/room/${room_id}`);
    };


    // UNIRSE A SALA
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);

    const join = async () => {

        const code = parsearInvitacion(roomCode);

        setLoading(true);
        console.log(loading);
        const { data: roomId, error } = await supabase.rpc("join_room", { p_code: code });
        setLoading(false);

        if (error) {
            console.log(error.message);
            toast.error(error.message || "No se pudo unir.");
            return;
        }
        navigate(`/room/${roomId}`);
    };


    return (

        // 'w-full' asegura que ocupe todo el espacio a los lados
        // Usamos colores oscuros de la paleta zinc que coinciden con tu diseño original
        <div className="w-full bg-transparent border-none overflow-hidden">
            <div className=" flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800">

                {/* SECCIÓN IZQUIERDA: CREAR SALA */}
                <div className="flex-1 py-6 pr-6 md:py-8 flex flex-col justify-start">
                    <div className="mb-2 flex items-center gap-2">
                        <h2 className="text-xl font-bold tracking-wide">Nueva Sala</h2>
                    </div>
                    <p className=" text-sm mb-6 grow">
                        Crea una sala para iniciar una sesión de Pomodoro y obtén un enlace para compartir con tus amigos.
                    </p>
                    <Button
                        onClick={crearSala}
                        className="w-full text-white py-6 text-md transition-colors">
                        Crear
                    </Button>
                </div>

                {/* SECCIÓN DERECHA: UNIRSE A SALA */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-start">
                    <div className="mb-2 flex items-center gap-2">
                        <h2 className="text-xl font-bold  tracking-wide">Unirse a sala</h2>
                    </div>
                    <p className=" text-sm mb-6 grow">
                        ¿Ya tienes una invitación? Introduce el código de la sala para unirte a una sesión existente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="text"
                            placeholder="Código de sala (Ej: 0852EF11)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            className="border-zinc-700  h-12 grow focus-visible:ring-[#8b5cf6]"
                        />

                        <Button
                            disabled={!roomCode}
                            variant="outline"
                            className="h-12 border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 sm:w-1/3"
                            onClick={join}
                        >
                            Unirse
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalaNueva;