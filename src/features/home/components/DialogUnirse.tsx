import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "@/lib/supabase"
import { parsearInvitacion } from "@/features/home/parsearInvitacion"
import DialogCargando from "@/features/home/components/DialogCargando"


const DialogUnirse = () => {
    const [value, setValue] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const join = async (currentValue?: string) => {


        setErrorMsg(null);
        const codeToParse = currentValue !== undefined ? currentValue : value;
        const code = parsearInvitacion(codeToParse);
        if (!code) {
            setErrorMsg("Pegá un código válido o un link de invitación.");
            return;
        }

        setLoading(true);
        const { data: roomId, error } = await supabase.rpc("join_room", { p_code: code });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message || "No se pudo unir.");
            return;
        }
        navigate(`/room/${roomId}`);
    };


    if (loading) {
        return (
            <Dialog>
                <DialogTrigger asChild><Button variant="outline" className="w-full h-10">Unirse</Button></DialogTrigger>
                <DialogContent className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Unirse a la sala</DialogTitle>
                    </DialogHeader>
                    <DialogCargando />
                </DialogContent>
            </Dialog>
        )
    }
    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="w-full h-10">Unirse</Button></DialogTrigger>
            <DialogContent className="flex flex-col gap-6">
                <DialogHeader>
                    <DialogTitle>Unirse a la sala</DialogTitle>
                    <DialogDescription>
                        Introduce el código de la sala
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    join(); 
                }}>
                    <div>
                        <Input 
                            placeholder="Código" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>
                    {errorMsg && <p className="text-destructive text-sm mt-2">{errorMsg}</p>}
                    <DialogFooter className="sm:justify-start mt-6">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Unirse</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default DialogUnirse
