import { useNavigate } from "react-router-dom"
import { UserAuth } from "../services/AuthContexto"
import Perfil from "../features/home/components/Perfil"

const Home = () => {
    const navigate = useNavigate()
    const { cerrarSesion } = UserAuth()
    const { user } = UserAuth()
    return (
        <div className="">
            <Perfil usuario={user?.name} correo={user?.email} foto={user?.picture} />
            <div className="mb-6 justify-center items-center flex">
            <h1 className="text-4xl font-bold mb-6 ">Home</h1>
            </div>
            <div className="flex  items-center justify-center p-10 bg-gray-800 rounded-2xl shadow-xl text-white">
            <button className="px-8 py-3 rounded-full font-bold text-xl bg-blue-500 hover:bg-blue-600 transition-all" onClick={() => navigate('/timer')}>Timer</button>
            <button className="px-8 py-3 rounded-full font-bold text-xl bg-blue-500 hover:bg-blue-600 transition-all" onClick={() => navigate('/login')}>Login</button>
            <button className="px-8 py-3 rounded-full font-bold text-xl bg-blue-500 hover:bg-blue-600 transition-all" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="px-8 py-3 rounded-full font-bold text-xl bg-red-500 hover:bg-red-600 transition-all" onClick={cerrarSesion}>Logout</button>
        </div>
        </div>
    )
}
export default Home
