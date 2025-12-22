

const Perfil = ({ usuario = "Usuario", correo = "Correo", foto = "Foto" }: any) => {
    return (
        <div className="flex flex-row items-center justify-between p-3 rounded-lg gap-4 bg-zinc-800 shadow-lg">
            <p className="font-bold text-xs">{usuario}</p>
            <p className="font-bold text-xs">{correo}</p>
            <img src={foto} alt="" className="w-12 h-12 rounded-full" />
        </div>
    )
}

export default Perfil
